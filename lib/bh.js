function BH() {
    this._lastMatchId = 0;
    this._matchers = [];
    this._dirtyEnv = false;
    for (var i in {}) {
        this._dirtyEnv = true;
        break;
    }
    this._infiniteLoopDetection = false;
    this._selfCloseHtmlTags = {
        area: 1,
        base: 1,
        br: 1,
        col: 1,
        command: 1,
        embed: 1,
        hr: 1,
        img: 1,
        input: 1,
        keygen: 1,
        link: 1,
        meta: 1,
        param: 1,
        source: 1,
        wbr: 1
    };
    /**
     * External libs namespace.
     * @type {Object}
     */
    this.lib = {};
    this.utils = {
        _lastGenId: 0,
        bh: this,
        extend: function(target) {
            typeof target !== 'object' && (target = {});
            for(var i = 1, len = arguments.length; i < len; i++) {
                var obj = arguments[i];
                if(obj) {
                    for(var key in obj) {
                        obj.hasOwnProperty(key) && (target[key] = obj[key]);
                    }
                }
            }
            return target;
        },
        isArray: function (obj) {
            return Array.isArray(obj);
        },
        position: function () {
            var node = this.node;
            return node.index === 'content' ? 0 : node.index;
        },
        isFirst: function () {
            var node = this.node;
            return node.index === 'content' || node.index === 0;
        },
        isLast: function () {
            var node = this.node;
            return node.index === 'content' || node.index === node.arr.length - 1;
        },
        tParam: function (key, value) {
            var keyName = '__tp_' + key;
            if (arguments.length === 2) {
                this.node[keyName] = value;
            } else {
                var node = this.node;
                while (node) {
                    if (node.hasOwnProperty(keyName)) {
                        return node[keyName];
                    }
                    node = node.parentNode;
                }
            }
        },
        apply: function (bemjson) {
            return this.bh.processBemjson(bemjson);
        },
        generateId: function () {
            return 'uniq' + (this._lastGenId++);
        },
        mod: function(key, value, force) {
            var mods;
            if (value !== undefined) {
                mods = this.ctx.mods || (this.ctx.mods = {});
                mods[key] = mods[key] === undefined || force ? value : mods[key];
                return this;
            } else {
                mods = this.ctx.mods;
                return mods ? mods[key] : undefined;
            }
        },
        mods: function(values, force) {
            var mods = this.ctx.mods || (this.ctx.mods = {});
            if (values !== undefined) {
                for (var key in values) {
                    if (this.bh._dirtyEnv && !values.hasOwnProperty(key)) continue;
                    mods[key] = mods[key] === undefined || force ? values[key] : mods[key];
                }
                return this;
            } else {
                return mods;
            }
        },
        tag: function(tagName, force) {
            if (tagName !== undefined) {
                this.ctx.tag = this.ctx.tag === undefined || force ? tagName : this.ctx.tag;
                return this;
            } else {
                return this.ctx.tag;
            }
        },
        mix: function(mix, force) {
            if (mix !== undefined) {
                this.ctx.mix = this.ctx.mix === undefined || force ? mix : this.ctx.mix;
                return this;
            } else {
                return this.ctx.mix;
            }
        },
        attr: function(key, value, force) {
            var attrs;
            if (value !== undefined) {
                attrs = this.ctx.attrs || (this.ctx.attrs = {});
                attrs[key] = attrs[key] === undefined || force ? value : attrs[key];
                return this;
            } else {
                attrs = this.ctx.attrs;
                return attrs ? attrs[key] : undefined;
            }
        },
        bem: function(bem, force) {
            if (bem !== undefined) {
                this.ctx.bem = this.ctx.bem === undefined || force ? bem : this.ctx.bem;
                return this;
            } else {
                return this.ctx.bem;
            }
        },
        js: function(js, force) {
            if (js !== undefined) {
                this.ctx.js = this.ctx.js === undefined || force ? js : this.ctx.js;
                return this;
            } else {
                return this.ctx.js;
            }
        },
        cls: function(cls, force) {
            if (cls !== undefined) {
                this.ctx.cls = this.ctx.cls === undefined || force ? cls : this.ctx.cls;
                return this;
            } else {
                return this.ctx.cls;
            }
        },
        param: function(key, value, force) {
            if (value !== undefined) {
                this.ctx[key] = this.ctx[key] === undefined || force ? value : this.ctx[key];
                return this;
            } else {
                return this.ctx[key];
            }
        },
        content: function(value, force) {
            if (arguments.length > 0) {
                this.ctx.content = this.ctx.content === undefined || force ? value : this.ctx.content;
                return this;
            } else {
                return this.ctx.content;
            }
        },
        json: function() {
            return this.ctx;
        }
    };
}

BH.prototype = {

    /**
     * Enables or disables infinite loop detection.
     * @param {Boolean} enable
     */
    enableInfiniteLoopDetection: function(enable) {
        this._infiniteLoopDetection = enable;
    },

    /**
     * Converts BEMJSON to HTML code.
     * @param {Object|Array|String} bemjson
     */
    apply: function (bemjson) {
        return this.toHtml(this.processBemjson(bemjson));
    },

    /**
     * Declares matcher.
     * @example
     *
     *      bh.match('b-page', function(ctx) {
     *          ctx.mix.push({ block: 'i-ua' });
     *          ctx.cls = ctx.cls || 'i-ua_js_no i-ua_css_standard';
     *      });
     *
     *      bh.match('block_mod_modVal', function(ctx) {
     *          ctx.tag = ctx.tag || 'span';
     *      });
     *
     *      bh.match('block__elem', function(ctx) {
     *          ctx.attrs.disabled = 'disabled';
     *      });
     *
     *      bh.match('block__elem_elemMod_elemModVal', function(ctx) {
     *          ctx.mods.active = ctx.mods.active || 'yes';
     *      });
     *
     *      bh.match('block_blockMod_blockModVal__elem', function(ctx) {
     *          ctx.content = {
     *              elem: 'wrapper',
     *              content: ctx
     *          };
     *      });
     *
     * @param {String} expr
     * @param {Function} matcher
     */
    match: function (expr, matcher) {
        matcher.__id = '__func' + (this._lastMatchId++);
        this._matchers.push([expr, matcher]);
    },

    buildMatcher: function () {

        function groupBy(data, key) {
            var res = {};
            for (var i = 0, l = data.length; i < l; i++) {
                var item = data[i];
                var value = item[key] || '__no_value__';
                (res[value] || (res[value] = [])).push(item);
            }
            return res;
        }

        var i, j, l;
        var res = ['(function(ms) {'];
        var vars = ['bh = this'];
        var allMatchers = this._matchers;
        var decl, expr, matcherInfo;
        var declarations = [], exprBits, blockExprBits;
        for (i = allMatchers.length - 1; i > 0; i--) {
            matcherInfo = allMatchers[i];
            expr = matcherInfo[0];
            if (expr) {
                vars.push('_m' + i + ' = ms[' + i + '][1]');
                decl = { fn: matcherInfo[1], index: i };
                if (~expr.indexOf('__')) {
                    exprBits = expr.split('__');
                    blockExprBits = exprBits[0].split('_');
                    decl.block = blockExprBits[0];
                    if (blockExprBits.length > 1) {
                        decl.blockMod = blockExprBits[1];
                        decl.blockModVal = blockExprBits[2];
                    }
                    exprBits = exprBits[1].split('_');
                    decl.elem = exprBits[0];
                    if (exprBits.length > 1) {
                        decl.mod = exprBits[1];
                        decl.modVal = exprBits[2];
                    }
                } else {
                    exprBits = expr.split('_');
                    decl.block = exprBits[0];
                    if (exprBits.length > 1) {
                        decl.mod = exprBits[1];
                        decl.modVal = exprBits[2];
                    }
                }
                declarations.push(decl);
            }
        }
        var declByBlock = groupBy(declarations, 'block');
        res.push('var ' + vars.join(', ') + ';');
        res.push('function applyMatchers(ctx, json) {');
        res.push('var subRes;');

        res.push('switch (json.block) {');
        for (var blockName in declByBlock) {
            if (this._dirtyEnv && !declByBlock.hasOwnProperty(blockName)) continue;
            res.push('case "' + blockName + '":');
            var declsByElem = groupBy(declByBlock[blockName], 'elem');

            res.push('switch (json.elem) {');
            for (var elemName in declsByElem) {
                if (this._dirtyEnv && !declsByElem.hasOwnProperty(elemName)) continue;

                if (elemName === '__no_value__') {
                    res.push('case undefined:');
                } else {
                    res.push('case "' + elemName + '":');
                }
                var decls = declsByElem[elemName];
                for (j = 0, l = decls.length; j < l; j++) {
                    decl = decls[j];
                    var fn = decl.fn;
                    var conds = [];
                    conds.push('!json.' + fn.__id);
                    decl.mod && conds.push('json.mods && json.mods.' + decl.mod + ' === "' + decl.modVal + '"');
                    if (decl.blockMod) {
                        conds.push('json.blockMods && json.blockMods.' + decl.blockMod + ' === "' + decl.blockModVal + '"');
                    }
                    res.push('if (' + conds.join(' && ') + ') {');
                    res.push('json.' + fn.__id + ' = true;');
                    res.push('subRes = _m' + decl.index + '(ctx, json);');
                    res.push('if (subRes) { return subRes; }');
                    res.push('}');
                }
                res.push('return;');
            }
            res.push('}');

            res.push('return;');
        }
        res.push('}');
        res.push('};');
        res.push('return applyMatchers;');
        res.push('})');
        return res.join('\n');
    },

    processBemjson: function (bemjson, blockName) {
        var utils = this.utils;
        var resultArr = [bemjson];
        var nodes = [{ json: bemjson, arr: resultArr, index: 0, blockName: blockName, blockMods: bemjson.mods || {} }];
        var node, json, block, blockMods, i, l, p, child, subRes;
        var compiledMatcher = (this._fastMatcher || (this._fastMatcher = eval(this.buildMatcher())(this._matchers)));
        function Ctx() {}
        Ctx.prototype = this.utils;
        var ctx = new Ctx();
        while (node = nodes.shift()) {
            json = node.json;
            block = node.blockName;
            blockMods = node.blockMods;
            if (Array.isArray(json)) {
                for (i = 0, l = json.length; i < l; i++) {
                    child = json[i];
                    if (child !== false && child != null && typeof child !== 'string') {
                        nodes.push({ json: child, arr: json, index: i, blockName: block, blockMods: blockMods, parentNode: node });
                    }
                }
            } else {
                var content, stopProcess = false;
                if (json.elem) {
                    block = json.block = json.block || block;
                    blockMods = json.blockMods = json.blockMods || blockMods;
                } else if (json.block) {
                    block = json.block;
                    blockMods = json.mods || (json.mods = {});
                }

                if (json.block) {

                    if (this._infiniteLoopDetection) {
                        json.__processCounter = (json.__processCounter || 0) + 1;
                        if (json.__processCounter > 100) {
                            throw new Error('Infinite loop detected at "' + json.block + (json.elem ? '__' + json.elem : '') + '".');
                        }
                    }

                    subRes = null;

                    utils.node = node;
                    utils.ctx = json;

                    subRes = compiledMatcher(ctx, json);

                    if (subRes) {
                        json = subRes;
                        node.json = json;
                        node.blockName = block;
                        node.blockMods = blockMods;
                        nodes.push(node);
                        stopProcess = true;
                    }
                }
                if (!stopProcess) {
                    if (Array.isArray(json)) {
                        node.json = json;
                        node.blockName = block;
                        node.blockMods = blockMods;
                        nodes.push(node);
                    } else {
                        if (content = json.content) {
                            if (Array.isArray(content)) {
                                do {
                                    var flatten = false;
                                    for (i = 0, l = content.length; i < l; i++) {
                                        if (Array.isArray(content[i])) {
                                            flatten = true;
                                            break;
                                        }
                                    }
                                    if (flatten) {
                                        var res = [];
                                        for (i = 0, l = content.length; i < l; i++) {
                                            res = res.concat(content[i]);
                                        }
                                        json.content = content = res;
                                    }
                                } while (flatten);
                                for (i = 0, l = content.length, p = l - 1; i < l; i++) {
                                    child = content[i];
                                    if (child !== false && child != null && typeof child !== 'string') {
                                        nodes.push({ json: child, arr: content, index: i, blockName: block, blockMods: blockMods, parentNode: node });
                                    }
                                }
                            } else {
                                nodes.push({ json: content, arr: json, index: 'content', blockName: block, blockMods: blockMods, parentNode: node });
                            }
                        }
                    }
                }
            }
            node.arr[node.index] = json;
        }
        return resultArr[0];
    },

    escapeAttr: function (attrVal) {
        return (attrVal + '').replace(/&/g, '&amp;')
               .replace(/"/g, '&quot;');
    },

    toHtml: function (json) {
        var res, i, l, item;
        if (json === false || json == null) return '';
        if (typeof json === 'string') {
            return json;
        }
        else if (Array.isArray(json)) {
            res = '';
            for (i = 0, l = json.length; i < l; i++) {
                item = json[i];
                if (item !== false && item != null) {
                    res += this.toHtml(item);
                }
            }
            return res;
        } else {
            var cls = json.bem !== false && json.block ? this.toBEMCssClasses(json, json.block) : '',
                jattr, attrs = '', jsParams, hasMixJsParams = false;

            if (jattr = json.attrs) {
                if (this._dirtyEnv) {
                    for (i in jattr) {
                        jattr.hasOwnProperty(i) && (attrs += ' ' + i + '="' + this.escapeAttr(jattr[i]) + '"');
                    }
                } else {
                    for (i in jattr) {
                        attrs += ' ' + i + '="' + this.escapeAttr(jattr[i]) + '"';
                    }
                }
            }

            if (json.js) {
                (jsParams = {})[json.block + (json.elem ? '__' + json.elem : '')] = json.js === true ? {} : json.js;
            }

            var mixes = json.mix;
            if (mixes && mixes.length) {
                for (i = 0, l = mixes.length; i < l; i++) {
                    var mix = mixes[i];
                    if (mix.js) {
                        (jsParams = jsParams || {})[(mix.block || json.block) + (mix.elem ? '__' + mix.elem : '')] = mix.js === true ? {} : mix.js;
                        hasMixJsParams = true;
                    }
                }
            }

            if (jsParams) {
                if (json.bem !== false) {
                    cls = cls + ' i-bem';
                }
            }

            if (jsParams) {
                attrs += (json.jsAttr || 'onclick') + '="return ' +
                    (!hasMixJsParams && json.js === true
                        ? '{&quot;' + json.block + (json.elem ? '__' + json.elem : '') + '&quot;:{}}'
                        : this.escapeAttr(JSON.stringify(jsParams))) + ';"';
            }

            json.cls && (cls = cls ? cls + ' ' + json.cls : json.cls);

            var content, tag = (json.tag || 'div');
            res = '<' + tag + (cls ? ' class="' + cls + '"' : '') + (attrs ? attrs : '');

            if (this._selfCloseHtmlTags[tag]) {
                res += '/>';
            } else {
                res += '>';
                if (content = json.content) {
                    if (Array.isArray(content)) {
                        for (i = 0, l = content.length; i < l; i++) {
                            item = content[i];
                            if (item !== false && item != null) {
                                res += this.toHtml(item);
                            }
                        }
                    } else {
                        res += this.toHtml(content);
                    }
                }
                res += '</' + tag + '>';
            }
            return res;
        }
    },

    toBEMCssClasses: function (json, blockName) {
        var mods, res, base = (json.block || blockName)
            + (json.elem ? '__' + json.elem : ''), mix, i, l;
        res = base;
        if (mods = json.mods) {
            if (this._dirtyEnv) {
                for (i in mods) {
                    mods.hasOwnProperty(i) && (res += ' ' + base + '_' + i + '_' + mods[i]);
                }
            } else {
                for (i in mods) {
                    res += ' ' + base + '_' + i + '_' + mods[i];
                }
            }
        }
        if ((mix = json.mix) && (l = mix.length)) {
            for (i = 0; i < l; i++) {
                res += ' ' + this.toBEMCssClasses(mix[i], blockName);
            }
        }
        return res;
    }

};

module.exports = BH;
