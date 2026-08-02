var BH = (function() {

var lastGenId = 0;

/**
 * BH: BEMJSON to HTML processor.
 * @constructor
 */
function BH() {
    /**
     * Identifies templates. Each template receives a unique ID to prevent it
     * from being applied to the same BEMJSON node more than once.
     * @type {Number}
     * @private
     */
    this._lastMatchId = 0;
    /**
     * Flat matcher storage. Each item contains a selector expression and a
     * template function: [{String} expression, {Function} template].
     * @type {Array}
     * @private
     */
    this._matchers = [];
    /**
     * Enables automatic loop detection. Use it in development to identify the
     * source of recursive processing.
     * @type {Boolean}
     * @private
     */
    this._infiniteLoopDetection = false;

    /**
     * Namespace for helpers that templates can reuse.
     * ```javascript
     * bh.lib.i18n = BEM.I18N;
     * bh.lib.objects = bh.lib.objects || {};
     * bh.lib.objects.inverse = bh.lib.objects.inverse || function(obj) { ... };
     * ```
     * @type {Object}
     */
    this.lib = {};
    /**
     * Lookup table for short tags. Extend it with setOptions({ shortTags: [...] }).
     */
    this._shortTags = {};
    for (var i = 0; i < SHORT_TAGS.length; i++) {
        this._shortTags[SHORT_TAGS[i]] = 1;
    }
    /**
     * BH options configured through setOptions.
     * @type {Object}
     */
    this._options = {};
    this._optJsAttrName = 'onclick';
    this._optJsAttrIsJs = true;
    this._optJsCls = 'i-bem';
    this._optJsElem = true;
    this._optEscapeContent = false;
    this._optNobaseMods = false;
    this._optDelimElem = '__';
    this._optDelimMod = '_';
    this._optShortTagCloser = '/>';
    this.utils = {
        _expandoId: new Date().getTime(),
        bh: this,
        /**
         * Checks whether a value is simple content rather than a BEMJSON node.
         * ```javascript
         * bh.match('link', function(ctx) {
         *     ctx.tag(ctx.isSimple(ctx.content()) ? 'span' : 'div');
         * });
         * ```
         * @param {*} obj
         * @returns {Boolean}
         */
        isSimple: function(obj) {
            if (!obj || obj === true) return true;
            var t = typeof obj;
            return t === 'string' || t === 'number';
        },
        /**
         * Extends an object with properties from one or more source objects.
         * Similar to jQuery.extend.
         * ```javascript
         * obj = ctx.extend(obj, {a: 1});
         * ```
         * @param {Object} target
         * @returns {Object}
         */
        extend: function(target) {
            if (!target || typeof target !== 'object') {
                target = {};
            }
            for (var i = 1, len = arguments.length; i < len; i++) {
                var obj = arguments[i],
                    key;
                /* istanbul ignore else */
                if (obj) {
                    for (key in obj) {
                        target[key] = obj[key];
                    }
                }
            }
            return target;
        },
        /**
         * Returns the one-based position of the current node within its parent.
         * ```javascript
         * bh.match('list__item', function(ctx) {
         *     ctx.mod('pos', ctx.position());
         * });
         * ```
         * @returns {Number}
         */
        position: function() {
            var node = this.node;
            return node.index === 'content' ? 1 : node.position;
        },
        /**
         * Returns true when the current BEMJSON node is the first child of its parent.
         * ```javascript
         * bh.match('list__item', function(ctx) {
         *     if (ctx.isFirst()) {
         *         ctx.mod('first', 'yes');
         *     }
         * });
         * ```
         * @returns {Boolean}
         */
        isFirst: function() {
            var node = this.node;
            return node.index === 'content' || node.position === 1;
        },
        /**
         * Returns true when the current BEMJSON node is the last child of its parent.
         * ```javascript
         * bh.match('list__item', function(ctx) {
         *     if (ctx.isLast()) {
         *         ctx.mod('last', 'yes');
         *     }
         * });
         * ```
         * @returns {Boolean}
         */
        isLast: function() {
            var node = this.node;
            return node.index === 'content' || node.position === node.arr._listLength;
        },
        /**
         * Passes a parameter down the BEMJSON tree.
         * **force** replaces an existing value.
         * ```javascript
         * bh.match('input', function(ctx) {
         *     ctx.content({ elem: 'control' });
         *     ctx.tParam('value', ctx.param('value'));
         * });
         * bh.match('input__control', function(ctx) {
         *     ctx.attr('value', ctx.tParam('value'));
         * });
         * ```
         * @param {String} key
         * @param {*} value
         * @param {Boolean} [force]
         * @returns {*|Ctx}
         */
        tParam: function(key, value, force) {
            var keyName = '__tp_' + key;
            var node = this.node;
            if (arguments.length > 1) {
                if (force || !this.tParam(key))
                    node[keyName] = value;
                return this;
            } else {
                while (node) {
                    if (node.hasOwnProperty(keyName)) {
                        return node[keyName];
                    }
                    node = node.parentNode;
                }
                return undefined;
            }
        },
        /**
         * Applies templates to a BEMJSON fragment in the current block context.
         * @param {BemJson} bemJson
         * @returns {Object|Array}
         */
        process: function(bemJson) {
            var prevCtx = this.ctx,
                prevNode = this.node;
            var res = this.bh.processBemJson(bemJson, prevCtx.block);
            this.ctx = prevCtx;
            this.node = prevNode;
            return res;
        },
        /**
         * Applies the remaining templates to the current BEMJSON node.
         * This is useful when a derived template must operate on content after
         * the base templates have modified it.
         * Example:
         * ```javascript
         * bh.match('header', function(ctx) {
         *    ctx.content([
         *        ctx.content(),
         *        { elem: 'under' }
         *    ], true);
         * });
         * bh.match('header_float_yes', function(ctx) {
         *    ctx.applyBase();
         *    ctx.content([
         *        ctx.content(),
         *        { elem: 'clear' }
         *    ], true);
         * });
         * ```
         * @returns {Ctx}
         */
        applyBase: function() {
            var node = this.node;
            var json = node.json;
            var block = json.block;
            var blockMods = json.mods;

            var subRes = this.bh._fastMatcher(this, json);
            if (subRes !== undefined) {
                this.ctx = node.arr[node.index] = node.json = subRes;
                node.block = block;
                node.mods = blockMods;
            }
            return this;
        },
        /**
         * Stops any remaining templates for the current BEMJSON node.
         * Example:
         * ```javascript
         * bh.match('button', function(ctx) {
         *     ctx.tag('button', true);
         * });
         * bh.match('button', function(ctx) {
         *     ctx.tag('span');
         *     ctx.stop();
         * });
         * ```
         * @returns {Ctx}
         */
        stop: function() {
            this.ctx._stop = true;
            return this;
        },
        /**
         * Returns a unique identifier, for example to associate a `label` with
         * an `input`.
         * @returns {String}
         */
        generateId: function() {
            return 'uniq' + this._expandoId + (++lastGenId);
        },
        /**
         * Gets or sets a modifier depending on the arguments.
         * **force** replaces an existing modifier.
         * ```javascript
         * bh.match('input', function(ctx) {
         *     ctx.mod('native', 'yes');
         *     ctx.mod('disabled', true);
         * });
         * bh.match('input_islands_yes', function(ctx) {
         *     ctx.mod('native', '', true);
         *     ctx.mod('disabled', false, true);
         * });
         * ```
         * @param {String} key
         * @param {String|Boolean} [value]
         * @param {Boolean} [force]
         * @returns {String|undefined|Ctx}
         */
        mod: function(key, value, force) {
            var field = this.ctx.elem ? 'elemMods' : 'mods';
            if (arguments.length > 1) {
                var mods = this.ctx[field];
                mods[key] = !mods.hasOwnProperty(key) || force ? value : mods[key];
                return this;
            } else {
                return this.ctx[field][key];
            }
        },
        /**
         * Gets or sets modifiers depending on the arguments.
         * **force** replaces existing modifiers.
         * ```javascript
         * bh.match('paranja', function(ctx) {
         *     ctx.mods({
         *         theme: 'normal',
         *         disabled: true
         *     });
         * });
         * ```
         * @param {Object} [values]
         * @param {Boolean} [force]
         * @returns {Object|Ctx}
         */
        mods: function(values, force) {
            var field = this.ctx.elem ? 'elemMods' : 'mods';
            var mods = this.ctx[field];
            if (values !== undefined) {
                this.ctx[field] = force ? this.extend(mods, values) : this.extend(values, mods);
                return this;
            } else {
                return mods;
            }
        },
        /**
         * Gets or sets the tag depending on the arguments.
         * **force** replaces an existing tag.
         * ```javascript
         * bh.match('input', function(ctx) {
         *     ctx.tag('input');
         * });
         * ```
         * @param {String} [value]
         * @param {Boolean} [force]
         * @returns {String|undefined|Ctx}
         */
        tag: function(value, force) {
            if (value === undefined) {
                return this.ctx.tag;
            }
            if (force || this.ctx.tag === undefined) {
                this.ctx.tag = value;
            }
            return this;
        },
        /**
         * Gets or sets the mix depending on the arguments. When **force** is
         * true, the new mix replaces the old value; otherwise mixes are merged.
         * ```javascript
         * bh.match('button_pseudo_yes', function(ctx) {
         *     ctx.mix({ block: 'link', mods: { pseudo: 'yes' } });
         *     ctx.mix([
         *         { elem: 'text' },
         *         { block: 'ajax' }
         *     ]);
         * });
         * ```
         * @param {Array|BemJson} [mix]
         * @param {Boolean} [force]
         * @returns {Array|undefined|Ctx}
         */
        mix: function(mix, force) {
            if (mix === undefined) {
                return this.ctx.mix;
            }
            this.ctx.mix = (force || !this.ctx.mix) ?
                mix :
                (Array.isArray(this.ctx.mix) ? this.ctx.mix : [this.ctx.mix])
                    .concat(mix);
            return this;
        },
        /**
         * Gets or sets an attribute depending on the arguments.
         * **force** replaces an existing attribute.
         * @param {String} key
         * @param {String} [value]
         * @param {Boolean} [force]
         * @returns {String|undefined|Ctx}
         */
        attr: function(key, value, force) {
            var attrs;
            if (arguments.length > 1) {
                attrs = this.ctx.attrs || (this.ctx.attrs = {});
                attrs[key] = !attrs.hasOwnProperty(key) || force ? value : attrs[key];
                return this;
            } else {
                attrs = this.ctx.attrs;
                return attrs ? attrs[key] : undefined;
            }
        },
        /**
         * Gets or sets attributes depending on the arguments.
         * **force** replaces existing attributes.
         * ```javascript
         * bh.match('input', function(ctx) {
         *     ctx.attrs({
         *         name: ctx.param('name'),
         *         autocomplete: 'off'
         *     });
         * });
         * ```
         * @param {Object} [values]
         * @param {Boolean} [force]
         * @returns {Object|Ctx}
         */
        attrs: function(values, force) {
            var attrs = this.ctx.attrs || {};
            if (values === undefined) {
                return attrs;
            }
            this.ctx.attrs = force ? this.extend(attrs, values) : this.extend(values, attrs);
            return this;
        },
        /**
         * Gets or sets the `bem` flag depending on the arguments.
         * **force** replaces an existing value. When `bem` is `false`, the node
         * does not receive BEM classes.
         * ```javascript
         * bh.match('meta', function(ctx) {
         *     ctx.bem(false);
         * });
         * ```
         * @param {Boolean} [value]
         * @param {Boolean} [force]
         * @returns {Boolean|undefined|Ctx}
         */
        bem: function(value, force) {
            if (value === undefined) {
                return this.ctx.bem;
            }
            if (force || this.ctx.bem === undefined) {
                this.ctx.bem = value;
            }
            return this;
        },
        /**
         * Gets or sets the `js` value depending on the arguments.
         * **force** replaces an existing value. The browser uses `js` data to
         * initialize blocks through `BEM.DOM.init()`.
         * ```javascript
         * bh.match('input', function(ctx) {
         *     ctx.js(true);
         * });
         * ```
         * @param {Boolean|Object} [js]
         * @param {Boolean} [force]
         * @returns {Boolean|Object|Ctx}
         */
        js: function(js, force) {
            var ctx = this.ctx;
            if (js === undefined) return ctx.js;
            if (force || ctx.js === undefined) ctx.js = js;
            else if (ctx.js !== false) ctx.js = this.extend(ctx.js, js);
            return this;
        },
        /**
         * Gets or sets additional CSS classes depending on the arguments.
         * **force** replaces an existing value.
         * ```javascript
         * bh.match('page', function(ctx) {
         *     ctx.cls('ua_js_no ua_css_standard');
         * });
         * ```
         * @param {String} [value]
         * @param {Boolean} [force]
         * @returns {String|Ctx}
         */
        cls: function(value, force) {
            if (value === undefined) {
                return this.ctx.cls;
            }
            if (force || this.ctx.cls === undefined) {
                this.ctx.cls = value;
            }
            return this;
        },
        /**
         * Gets or sets a property of the current BEMJSON node.
         * **force** replaces an existing value. Example:
         * ```javascript
         * // Example input: { block: 'search', action: '/act' }
         * bh.match('search', function(ctx) {
         *     ctx.attr('action', ctx.param('action') || '/');
         * });
         * ```
         * @param {String} key
         * @param {*} [value]
         * @param {Boolean} [force]
         * @returns {*|Ctx}
         */
        param: function(key, value, force) {
            if (value === undefined) {
                return this.ctx[key];
            }
            if (force || this.ctx[key] === undefined) {
                this.ctx[key] = value;
            }
            return this;
        },
        /**
         * Gets or sets escaped content depending on the arguments.
         * **force** replaces existing content.
         * ```javascript
         * bh.match('input', function(ctx) {
         *     ctx.content({ elem: 'control' });
         * });
         * ```
         * @param {BemJson} [value]
         * @param {Boolean} [force]
         * @returns {BemJson|Ctx}
         */
        content: function(value, force) {
            if (value === undefined) {
                return this.ctx.content;
            }
            if (force || this.ctx.content === undefined) {
                this.ctx.content = value;
            }
            return this;
        },
        /**
         * Gets or sets raw HTML content depending on the arguments.
         * **force** replaces existing content.
         * ```javascript
         * bh.match('input', function(ctx) {
         *     ctx.html({ elem: 'control' });
         * });
         * ```
         * @param {String} [value]
         * @param {Boolean} [force]
         * @returns {String|Ctx}
         */
        html: function(value, force) {
            if (value === undefined) {
                return this.ctx.html;
            }
            if (force || this.ctx.html === undefined) {
                this.ctx.html = value;
            }
            return this;
        },
        /**
         * Returns the current BEMJSON fragment. It can be returned from a
         * template when wrapping the current node.
         * ```javascript
         * bh.match('input', function(ctx) {
         *     return {
         *         elem: 'wrapper',
         *         content: ctx.json()
         *     };
         * });
         * ```
         * @returns {Object|Array}
         */
        json: function() {
            return this.ctx;
        }
    };
}

/**
 * Enqueues child BEMJSON nodes and assigns positions only to non-empty objects.
 * @param {Array} nodes
 * @param {Array} json
 * @param {String} block
 * @param {Object} blockMods
 * @param {Object} parentNode
 * @returns {undefined}
 */
function enqueueArrayNodes(nodes, json, block, blockMods, parentNode) {
    var child, i, j, l;
    for (i = 0, j = 0, l = json.length; i < l; i++) {
        child = json[i];
        if (child !== false && child != null && typeof child === 'object') {
            nodes.push({
                json: child,
                arr: json,
                index: i,
                position: ++j,
                block: block,
                mods: blockMods,
                parentNode: parentNode
            });
        }
    }
    json._listLength = j;
}

/**
 * Flattens a content array of arbitrary depth.
 * @param {Array} content
 * @returns {Array}
 */
function flattenContent(content) {
    var flatten, i, l;
    do {
        flatten = false;
        for (i = 0, l = content.length; i < l; i++) {
            if (Array.isArray(content[i])) {
                flatten = true;
                break;
            }
        }
        if (flatten) {
            content = content.concat.apply([], content);
        }
    } while (flatten);
    return content;
}

/**
 * Applies inherited block names and modifiers to the current BEMJSON node.
 * @param {Object} json
 * @param {Object} node
 * @returns {undefined}
 */
function inheritBemContext(json, node) {
    if (json.elem) {
        node.block = json.block = json.block || node.block;
        if (!json.elemMods) {
            json.elemMods = json.mods || {};
            json.mods = null;
        }
        node.mods = json.mods = json.mods || node.mods;
    } else if (json.block) {
        node.block = json.block;
        node.mods = json.mods = json.mods || {};
    }
}

/**
 * Checks the processing counters for a node and the compiled matcher.
 * @param {BH} bh
 * @param {Object} json
 * @param {Function} compiledMatcher
 * @returns {undefined}
 */
function detectInfiniteLoop(bh, json, compiledMatcher) {
    json.__processCounter = (json.__processCounter || 0) + 1;
    compiledMatcher.__processCounter = (compiledMatcher.__processCounter || 0) + 1;
    if (json.__processCounter > 100) {
        throw new Error('Infinite json loop detected at "' + json.block +
            (json.elem ? bh._optDelimElem + json.elem : '') + '".');
    }
    if (compiledMatcher.__processCounter > 1000) {
        throw new Error('Infinite matcher loop detected at "' + json.block +
            (json.elem ? bh._optDelimElem + json.elem : '') + '".');
    }
}

/**
 * Groups matcher declarations by the given field.
 * @param {Array} data
 * @param {String} key
 * @returns {Object}
 */
function groupMatcherDeclarations(data, key) {
    var res = {};
    for (var i = 0, l = data.length; i < l; i++) {
        var item = data[i];
        var value = item[key] || '__no_value__';
        (res[value] || (res[value] = [])).push(item);
    }
    return res;
}

/**
 * Parses a matcher expression into block, element, and modifier declarations.
 * @param {BH} bh
 * @param {Array} matcherInfo
 * @param {Number} index
 * @returns {Object}
 */
function createMatcherDeclaration(bh, matcherInfo, index) {
    var expr = matcherInfo[0];
    var exprBits, blockExprBits;
    var decl = { fn: matcherInfo[1], index: index };
    if (~expr.indexOf(bh._optDelimElem)) {
        exprBits = expr.split(bh._optDelimElem);
        blockExprBits = exprBits[0].split(bh._optDelimMod);
        decl.block = blockExprBits[0];
        if (blockExprBits.length > 1) {
            decl.blockMod = blockExprBits[1];
            decl.blockModVal = blockExprBits[2] || true;
        }
        exprBits = exprBits[1].split(bh._optDelimMod);
        decl.elem = exprBits[0];
        if (exprBits.length > 1) {
            decl.elemMod = exprBits[1];
            decl.elemModVal = exprBits[2] || true;
        }
    } else {
        exprBits = expr.split(bh._optDelimMod);
        decl.block = exprBits[0];
        if (exprBits.length > 1) {
            decl.blockMod = exprBits[1];
            decl.blockModVal = exprBits[2] || true;
        }
    }
    return decl;
}

/**
 * Appends one matcher call to the generated source.
 * @param {Array} res
 * @param {String} fnId
 * @param {Number} index
 * @returns {undefined}
 */
function appendMatcherCall(res, fnId, index) {
    res.push(
        'json.' + fnId + ' = true;',
        'subRes = _m' + index + '(ctx, json);',
        'if (subRes !== undefined) return (subRes || "");',
        'if (json._stop) return;');
}

/**
 * Appends a selector condition and matcher call to the generated source.
 * @param {Array} res
 * @param {Object} decl
 * @returns {undefined}
 */
function appendMatcherDeclaration(res, decl) {
    var fn = decl.fn;
    var conds = ['!json.' + fn.__id];
    if (decl.elemMod) {
        conds.push(
            'json.elemMods && json.elemMods["' + decl.elemMod + '"] === ' +
                (decl.elemModVal === true || '"' + decl.elemModVal + '"'));
    }
    if (decl.blockMod) {
        conds.push(
            'json.mods && json.mods["' + decl.blockMod + '"] === ' +
                (decl.blockModVal === true || '"' + decl.blockModVal + '"'));
    }
    res.push('if (' + conds.join(' && ') + ') {');
    appendMatcherCall(res, fn.__id, decl.index);
    res.push('}');
}

/**
 * Appends sequential calls to global matchers.
 * @param {Array} res
 * @param {Array} declarations
 * @returns {undefined}
 */
function appendGlobalMatchers(res, declarations) {
    for (var i = 0, l = declarations.length; i < l; i++) {
        var decl = declarations[i];
        appendMatcherCall(res, decl.fn.__id, decl.index);
    }
}

/**
 * Creates an optimized matcher dispatcher once and caches it in `_fastMatcher`,
 * avoiding repeated selector parsing for every BEMJSON node. `buildMatcher()`
 * produces the body of a factory that accepts only the registered matcher
 * functions and returns `applyMatchers(ctx, json)`. Matcher bodies and BEMJSON
 * data are never interpolated into the source. Selector fragments come from
 * trusted application configuration passed to `match()` during registration,
 * not from the user-supplied BEMJSON being processed.
 *
 * The dispatcher preserves declaration order, marks matchers already applied to
 * a node, and returns either a replacement node or `undefined` after in-place
 * mutation. `processBemJson` requeues replacement nodes. Global `beforeEach` and
 * `afterEach` handlers surround selector matchers. `test.match.js`,
 * `test.matchGlobal.js`, `test.processBemJson.js`, `test.applyBase.js`, and
 * `test.loop.js` protect these invariants through public BH behavior.
 * @param {BH} bh
 * @returns {Function}
 */
function compileMatcher(bh) {
    return Function('ms', bh.buildMatcher())(bh._matchers);
}

/**
 * Enqueues the content of a BEMJSON node for processing.
 * @param {Array} nodes
 * @param {Object} node
 * @param {Object} json
 * @returns {undefined}
 */
function enqueueContent(nodes, node, json) {
    var content = json.content;
    if (Array.isArray(content)) {
        json.content = content = flattenContent(content);
        enqueueArrayNodes(nodes, content, node.block, node.mods, node);
    } else {
        nodes.push({
            json: content,
            arr: json,
            index: 'content',
            block: node.block,
            mods: node.mods,
            parentNode: node
        });
    }
}

/**
 * Processes one queued BEMJSON node and schedules any follow-up work.
 * @param {BH} bh
 * @param {Array} nodes
 * @param {Object} node
 * @param {Object} ctx
 * @param {Function} compiledMatcher
 * @param {Boolean} processContent
 * @param {Boolean} infiniteLoopDetection
 * @returns {undefined}
 */
function processBemJsonNode(bh, nodes, node, ctx, compiledMatcher,
    processContent, infiniteLoopDetection) {
    var json = node.json;
    if (Array.isArray(json)) {
        enqueueArrayNodes(nodes, json, node.block, node.mods, node);
        node.arr[node.index] = json;
        return;
    }

    inheritBemContext(json, node);
    if (typeof json === 'object') {
        if (infiniteLoopDetection) {
            detectInfiniteLoop(bh, json, compiledMatcher);
        }
        /* istanbul ignore else */
        if (!json._stop) {
            ctx.node = node;
            ctx.ctx = json;
            var replacement = compiledMatcher(ctx, json);
            if (replacement !== undefined) {
                node.json = replacement;
                node.arr[node.index] = replacement;
                nodes.push(node);
                return;
            }
        }
    }

    if (processContent && json.content) {
        enqueueContent(nodes, node, json);
    }
    node.arr[node.index] = json;
}

/**
 * Serializes user-provided HTML attributes from a BEMJSON node.
 * @param {Object} json
 * @returns {String}
 */
function buildHtmlAttrs(json) {
    var attrs = '';
    var jattr, jval, i;
    if (jattr = json.attrs) {
        for (i in jattr) {
            jval = jattr[i];
            if (jval === true) {
                attrs += ' ' + i;
            } else if (jval !== false && jval !== null && jval !== undefined) {
                attrs += ' ' + i + '="' + attrEscape(jval) + '"';
            }
        }
    }
    return attrs;
}

/**
 * Adds BEM classes and JavaScript parameters contributed by mixes.
 * @param {BH} bh
 * @param {Object} json
 * @param {String} base
 * @param {Object} data
 * @returns {undefined}
 */
function addMixesToHtmlData(bh, json, base, data) {
    var mixes = json.mix;
    if (!mixes || !mixes.length) return;

    for (var i = 0, l = mixes.length; i < l; i++) {
        var mix = mixes[i];
        if (!mix || mix.bem === false) continue;

        var mixBlock = mix.block || json.block || '';
        var mixElem = mix.elem || (mix.block ? null : json.block && json.elem);
        var mixBase = mixBlock + (mixElem ? bh._optDelimElem + mixElem : '');
        if (!mixBlock) continue;

        data.cls += toBemCssClasses(
            mix, mixBase, base, bh._optNobaseMods, bh._optDelimMod);
        if (mix.js) {
            (data.jsParams = data.jsParams || {})[mixBase] =
                mix.js === true ? {} : mix.js;
            data.hasMixJsParams = true;
            if (!data.addJSInitClass) {
                data.addJSInitClass = mixBlock &&
                    (bh._optJsCls && (bh._optJsElem || !mixElem));
            }
        }
    }
}

/**
 * Builds class and attribute strings for a BEMJSON node.
 * @param {BH} bh
 * @param {Object} json
 * @returns {Object}
 */
function buildBemHtmlData(bh, json) {
    var data = {
            cls: '',
            attrs: buildHtmlAttrs(json),
            jsParams: null,
            hasMixJsParams: false
        };
    var base = json.block + (json.elem ? bh._optDelimElem + json.elem : '');

    if (json.block) {
        data.cls = toBemCssClasses(
            json, base, null, bh._optNobaseMods, bh._optDelimMod);
        if (json.js) {
            (data.jsParams = {})[base] = json.js === true ? {} : json.js;
        }
    }
    data.addJSInitClass = bh._optJsCls && (bh._optJsElem || !json.elem);
    addMixesToHtmlData(bh, json, base, data);

    if (data.jsParams) {
        if (data.addJSInitClass) data.cls += ' ' + bh._optJsCls;
        var jsData = !data.hasMixJsParams && json.js === true ?
            '{"' + base + '":{}}' :
            jsAttrEscape(JSON.stringify(data.jsParams));
        data.attrs += ' ' + (json.jsAttr || bh._optJsAttrName) + '=\'' +
            (bh._optJsAttrIsJs ? 'return ' + jsData : jsData) + '\'';
    }
    return data;
}

/**
 * Appends an array of BEMJSON values to the HTML buffer.
 * @param {BH} bh
 * @param {Array} json
 * @returns {undefined}
 */
function appendHtmlArray(bh, json) {
    for (var i = 0, l = json.length; i < l; i++) {
        var item = json[i];
        if (item !== false && item != null) {
            bh._html(item);
        }
    }
}

/**
 * Appends an opening tag, content, and closing tag to the HTML buffer.
 * @param {BH} bh
 * @param {Object} json
 * @param {String} cls
 * @param {String} attrs
 * @returns {undefined}
 */
function appendHtmlTag(bh, json, cls, attrs) {
    var tag = json.tag || 'div';
    bh._buf += '<' + tag + (cls ? ' class="' + cls + '"' : '') + (attrs ? attrs : '');

    if (bh._shortTags[tag]) {
        bh._buf += bh._optShortTagCloser;
    } else {
        bh._buf += '>';
        if (json.html) {
            bh._buf += json.html;
        } else {
            bh._html(json.content);
        }
        bh._buf += '</' + tag + '>';
    }
}

BH.prototype = {
    constructor: BH,

    /**
     * Configures rendering options.
     *
     * @param {Object} options
     *        {String} options[jsAttrName] Attribute used for the `js` value. Defaults to `onclick`.
     *        {String} options[jsAttrScheme] Serialization scheme for the `js` value:
     *                     `js` produces `return { ... }` and is the default;
     *                     `json` produces `{ ... }`.
     * @returns {BH}
     */
    setOptions: function(options) {
        var i;
        for (i in options) {
            this._options[i] = options[i];
        }
        if (options.jsAttrName) {
            this._optJsAttrName = options.jsAttrName;
        }
        if (options.jsAttrScheme) {
            this._optJsAttrIsJs = options.jsAttrScheme === 'js';
        }
        if (options.jsCls !== undefined) {
            this._optJsCls = options.jsCls;
        }
        if (options.hasOwnProperty('jsElem')) {
            this._optJsElem = options.jsElem;
        }
        if (options.clsNobaseMods) {
            this._optNobaseMods = true;
        }
        if (options.escapeContent) {
            this._optEscapeContent = options.escapeContent;
        }
        if (options.delimElem) {
            this._optDelimElem = options.delimElem;
        }
        if (options.delimMod) {
            this._optDelimMod = options.delimMod;
        }
        if (options.xhtml === false) {
            this._optShortTagCloser = '>';
        }
        if (options.shortTags) {
            for (var j = 0; j < options.shortTags.length; j++) {
                this._shortTags[options.shortTags[j]] = 1;
            }
        }

        return this;
    },

    /**
     * Returns the current rendering options.
     *
     * @returns {Object}
     */
    getOptions: function() {
        return this._options;
    },

    /**
     * Enables or disables loop detection.
     *
     * @param {Boolean} enable
     * @returns {BH}
     */
    enableInfiniteLoopDetection: function(enable) {
        this._infiniteLoopDetection = enable;
        return this;
    },

    /**
     * Converts BEMJSON into HTML.
     * @param {BemJson} bemJson
     * @returns {String}
     */
    apply: function(bemJson) {
        return this.toHtml(this.processBemJson(bemJson));
    },

    /**
     * Registers a template.
     * ```javascript
     * bh.match('page', function(ctx) {
     *     ctx.mix([{ block: 'ua' }]);
     *     ctx.cls('ua_js_no ua_css_standard');
     * });
     * bh.match('block_mod_modVal', function(ctx) {
     *     ctx.tag('span');
     * });
     * bh.match('block__elem', function(ctx) {
     *     ctx.attr('disabled', 'disabled');
     * });
     * bh.match('block__elem_elemMod', function(ctx) {
     *     ctx.mix([{ block: 'link' }]);
     * });
     * bh.match('block__elem_elemMod_elemModVal', function(ctx) {
     *     ctx.mod('active', 'yes');
     * });
     * bh.match('block_blockMod__elem', function(ctx) {
     *     ctx.param('checked', true);
     * });
     * bh.match('block_blockMod_blockModVal__elem', function(ctx) {
     *     ctx.content({
     *         elem: 'wrapper',
     *         content: ctx
     *     };
     * });
     * ```
     * @param {String|Array|Object} expr
     * @param {Function} matcher
     * @returns {BH}
     */
    match: function(expr, matcher) {
        if (!expr) return this;

        if (Array.isArray(expr)) {
            expr.forEach(function(match, i) {
                this.match(expr[i], matcher);
            }, this);
            return this;
        }

        if (typeof expr === 'object') {
            for (var i in expr) {
                this.match(i, expr[i]);
            }
            return this;
        }

        matcher.__id = '__func' + (this._lastMatchId++);
        this._matchers.push([expr, matcher]);
        this._fastMatcher = null;
        return this;
    },

    /**
     * Registers a global template that runs before selector templates.
     * ```javascript
     * bh.beforeEach(function(ctx, json) {
     *     ctx.attr('onclick', json.counter);
     * });
     * ```
     * @param {Function} matcher
     * @returns {BH}
     */
    beforeEach: function(matcher) {
        return this.match('$before', matcher);
    },

    /**
     * Registers a global template that runs after selector templates.
     * ```javascript
     * bh.afterEach(function(ctx) {
     *     ctx.tag('xdiv');
     * });
     * ```
     * @param {Function} matcher
     * @returns {BH}
     */
    afterEach: function(matcher) {
        return this.match('$after', matcher);
    },

    /**
     * Builds the source for a fast matcher dispatcher.
     * @returns {String}
     */
    buildMatcher: function() {
        var i, j, l;
        var res = [];
        var vars = ['bh = this'];
        var allMatchers = this._matchers;
        var matcherInfo;
        var declarations = [];
        for (i = allMatchers.length - 1; i >= 0; i--) {
            matcherInfo = allMatchers[i];
            vars.push('_m' + i + ' = ms[' + i + '][1]');
            declarations.push(createMatcherDeclaration(this, matcherInfo, i));
        }
        var declByBlock = groupMatcherDeclarations(declarations, 'block');

        var beforeEach = declByBlock.$before;
        var afterEach = declByBlock.$after;
        if (afterEach) delete declByBlock.$after;

        res.push(
            'var ' + vars.join(', ') + ';',
            'function applyMatchers(ctx, json) {',
            'var subRes;');

        if (beforeEach) {
            delete declByBlock.$before;
            appendGlobalMatchers(res, beforeEach);
        }

        res.push('switch (json.block) {');
        for (var blockName in declByBlock) {
            res.push('case "' + blockName + '":');
            var declsByElem = groupMatcherDeclarations(declByBlock[blockName], 'elem');

            res.push('switch (json.elem) {');
            for (var elemName in declsByElem) {
                if (elemName === '__no_value__') {
                    res.push('case undefined:');
                } else {
                    res.push('case "' + elemName + '":');
                }
                var decls = declsByElem[elemName];
                for (j = 0, l = decls.length; j < l; j++) {
                    appendMatcherDeclaration(res, decls[j]);
                }
                res.push('break;');
            }
            res.push(
                '}',
                'break;');
        }
        res.push('}');

        if (afterEach) {
            appendGlobalMatchers(res, afterEach);
        }

        res.push(
            '};',
            'return applyMatchers;');
        return res.join('\n');
    },

    /**
     * Expands shorthand BEMJSON into its fully processed representation.
     * @param {BemJson} bemJson
     * @param {String} [blockName]
     * @param {Boolean} [ignoreContent]
     * @returns {Object|Array}
     */
    processBemJson: function(bemJson, blockName, ignoreContent) {
        if (bemJson == null) return;
        var resultArr = [bemJson];
        var nodes = [{
                json: bemJson,
                arr: resultArr,
                index: 0,
                block: blockName,
                mods: null
            }];
        var node;
        var compiledMatcher = this._fastMatcher || (this._fastMatcher = compileMatcher(this));
        var processContent = !ignoreContent;
        var infiniteLoopDetection = this._infiniteLoopDetection;

        /**
         * Context wrapper for a BEMJSON node.
         * @constructor
         */
        function Ctx() {
            this.ctx = null;
        }
        Ctx.prototype = this.utils;
        var ctx = new Ctx();
        while (node = nodes.shift()) {
            processBemJsonNode(this, nodes, node, ctx, compiledMatcher,
                processContent, infiniteLoopDetection);
        }
        return resultArr[0];
    },

    /**
     * Converts processed BEMJSON into HTML.
     * @param {BemJson} json
     * @returns {String}
     */
    toHtml: function(json) {
        this._buf = '';
        this._html(json);
        var buf = this._buf;
        delete this._buf;
        return buf;
    },

    /**
     * Appends a BEMJSON value to the current HTML buffer.
     * @param {BemJson} json
     * @returns {undefined}
     */
    _html: function(json) {
        if (json === false || json == null) return;
        if (typeof json !== 'object') {
            this._buf += this._optEscapeContent ? xmlEscape(json) : json;
            return;
        }
        if (Array.isArray(json)) {
            appendHtmlArray(this, json);
            return;
        }
        if (json.toHtml) {
            this._buf += json.toHtml.call(this, json) || '';
            return;
        }
        if (typeof json.tag !== 'undefined' && !json.tag) {
            if (json.html) {
                this._buf += json.html;
            } else {
                this._html(json.content);
            }
            return;
        }
        if (json.mix && !Array.isArray(json.mix)) {
            json.mix = [json.mix];
        }

        var data = json.bem === false ?
            { cls: '', attrs: buildHtmlAttrs(json) } :
            buildBemHtmlData(this, json);
        if (json.cls) {
            data.cls = (data.cls ? data.cls + ' ' : '') + attrEscape(json.cls).trim();
        }
        appendHtmlTag(this, json, data.cls, data.attrs);
    }
};

var SHORT_TAGS = 'area base br col command embed hr img input keygen link menuitem meta param source track wbr'.split(' ');

/**
 * Preserves a value as text in HTML by replacing characters that HTML treats as
 * the beginning of an entity or markup with their corresponding entities.
 * @param {*} str
 * @returns {String}
 */
var xmlEscape = BH.prototype.xmlEscape = function(str) {
    return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

/**
 * Preserves a value inside a double-quoted HTML attribute by replacing
 * characters that begin an entity or terminate the attribute.
 * @param {*} str
 * @returns {String}
 */
var attrEscape = BH.prototype.attrEscape = function(str) {
    return (str + '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
};

/**
 * Preserves serialized JavaScript parameters inside a single-quoted HTML
 * attribute by replacing characters that begin an entity or terminate the
 * attribute without changing the source JSON structure.
 * @param {*} str
 * @returns {String}
 */
var jsAttrEscape = BH.prototype.jsAttrEscape = function(str) {
    return (str + '').replace(/&/g, '&amp;').replace(/'/g, '&#39;');
};

/**
 * Builds CSS classes for a block or element and its modifiers. The renderer uses
 * this helper for the main BEMJSON node and its mixes; it is intentionally not
 * part of the public API.
 * @param {Object} json
 * @param {String} base
 * @param {String} parentBase
 * @param {Boolean} nobase
 * @param {String} delimMod
 * @returns {String}
 */
var toBemCssClasses = function(json, base, parentBase, nobase, delimMod) {
    var mods, mod, res = '', i;

    if (parentBase !== base) {
        if (parentBase) res += ' ';
        res += base;
    }

    if (mods = json.elem && json.elemMods || json.mods) {
        for (i in mods) {
            mod = mods[i];
            if (mod || mod === 0) {
                res += ' ' + (nobase ? delimMod : base + delimMod) + i + (mod === true ? '' : delimMod + mod);
            }
        }
    }
    return res;
};

return BH;
})();

/* istanbul ignore else */
if (typeof module !== 'undefined') {
    module.exports = BH;
}
