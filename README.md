BH [![NPM version](https://badge.fury.io/js/bh.svg)](http://badge.fury.io/js/bh) [![Build Status](https://travis-ci.org/bem/bh.svg?branch=master)](https://travis-ci.org/bem/bh) [![Dependency Status](https://gemnasium.com/bem/bh.svg)](https://gemnasium.com/bem/bh) [![Coverage Status](https://img.shields.io/coveralls/bem/bh.svg?branch=master)](https://coveralls.io/r/bem/bh)
===

## What is this?

BH is processor that converts BEMJSON to HTML. Or in other words a template engine.

[Online demo](//bem.github.io/bh/).

## Advantages

BH is:

1. fast;
1. easy to debug due to no need of compilation to another code;
1. based on JavaScript (usage and extensions);
1. easy to understand – it is a wrapper over a regular conversion of source BEMJSON to output BEMJSON / HTML;
1. compact on client side (12.4 Kb after compression, 3.7 Kb after gzip);
1. does not require a compilation.

## Install

You can find BH processor within `bh` npm package. ENB technologies for its usage are available in `enb-bh` npm package.

```
npm install bh
```

## Usage

BH files within a project have `bh.js` suffix (for example, `page.bh.js`). The file is formed in CommonJS format for NodeJS:

```javascript
module.exports = function(bh) {
    // ...
};
```

Use `apply` method to convert source tree of BEMJSON into an output HTML. Use `processBemJson` method to get an interim result in detailed BEMJSON tree form.

Common use case:

```javascript
var bh = new (require('bh').BH);
bh.match('button', function(ctx) {
    ctx.tag('button');
})
bh.processBemJson({ block: 'button' }); // { block: 'button', mods: {}, tag: 'button' }
bh.apply({ block: 'button' }); // '<button class="button"></button>'
```

## Conversion

Working functions for BEMJSON are **templates**. Use `match` method to declare templates. Logic of BEMJSON conversion is declared in a function body.

There are two arguments provided to a template function:
* `ctx` – instance of `Ctx` class;
* `json` – link to a current BEMJSON tree node.

*NB*: Do not make changes directly in `json` object. Use methods of `ctx` object instead. We recommend you to use `json` object for reading only (see also `ctx.json()` method).

Syntax:

```javascript
{BH} bh.match({String} expression, function({Ctx} ctx, {Object} json) {
    //.. actions
});
```

You could also declare several templates within one call of `match` method.

Syntax:

```javascript
{BH} bh.match({Array} expressions, function({Ctx} ctx));

```

Where `expressions` is an array like this:

```javascript
[
    {String} expression1,
    ...,

    {String} expressionN
]
```

Or in an object form:

```javascript
{BH} bh.match({Object} templates);

```

Where `templates` is an object like this:

```javascript
{
    {String} expression1 : function({Ctx} ctx) {
        //.. actions1
    },

    ...,

    {String} expressionN : function({Ctx} ctx) {
        //.. actionsN
    },
}
```

You can find below a list of `Ctx` class methods. Let's check examples for step-by-step explanation.

For instance, to declare `button` tag for `button` block and `input` tag for `input` block do the following:

```javascript
bh.match('button', function(ctx) {
    ctx.tag('button');
});
bh.match('input', function(ctx) {
    ctx.tag('input');
});
```

Now we are going to create a pseudo button that looks like a button and acts like a link. If `pseudo` modifier of the button is set to `true`, you need to add  tag `a` and attribute `role="button"` to your template.

```javascript
bh.match('button_pseudo_yes', function(ctx) {
    ctx
        .tag('a')
        .attr('role', 'button');
});
```

In this example, we do not match just to `button` block. We match to `button` block with modifier `pseudo` that has `true` value.

## Matching

Let's go into details of syntax of a matching string for conversion functions (optional parameters are set in square brackets) :

```javascript
'block[_blockModName[_blockModVal]][__elemName][_elemModName[_elemModVal]]'
```

In English:

```javascript
'block[_blockModifierName[_blockModifierValue]][__elementName][_elementModifierName[_elementModifierValue]]'
```

## Additional examples

For example, if you want to set `state` modifier with `closed` value for all blocks do the following:

```javascript
bh.match('popup', function(ctx) {
    ctx.mod('state', 'closed');
});
```

Mix `form` with `search-form`:

```javascript
bh.match('search-form', function(ctx) {
    ctx.mix({ block: 'form' });
});
```

Specify a class for `page` block:

```javascript
bh.match('page', function(ctx) {
    ctx.cls('ua_js_no ua_css_standard');
});
```

## BEMJSON-tree conversion

In addition to element modification, converter function can return a new BEMJSON. For this, we will use following methods:

* `ctx.json()` that returns a current element “as is”;
* `ctx.content()` that returns and sets a content.

For example, let's wrap `header` block with `header-wrapper` block:

```javascript
bh.match('header', function(ctx) {
    return {
        block: 'header-wrapper',
        content: ctx.json()
    };
});
```

Then wrap a content of `button` block with `content` element:

```javascript
bh.match('button', function(ctx) {
    ctx.content({
        elem: 'content',
        content: ctx.content()
    }, true);
});
```

`ctx.content` method gets BEMJSON as first argument that should be specified for a content. The second argument is a `force` flag that specifies a content even if it already exists.

Let's add following elements to `header` block:

* `before` element in the very beginning of the block content;
* `after` elemtnet in the end of the block content.

```javascript
bh.match('header', function(ctx) {
    ctx.content([
        { elem: 'before' },
        ctx.content(),
        { elem: 'after' }
    ], true);
});
```

Add `before-button` block before `button` block:

```javascript
bh.match('button', function(ctx) {
    return [
        { block: 'before-button' },
        ctx.json()
    ];
});
```

# `Ctx` class

`Ctx` class instances are passed to all templates. All class methods in a set mode return the class instance.

Let's examine the class methods:

## ctx.tag([value[, force]])

This class method returns/sets a tag depending on arguments. Use **force** to set the tag value even if it was specified earlier.

```javascript
bh.match('input', function(ctx) {
    ctx.tag('input');
});
```

*NB*: If you set a value as `false` or as an empty string, the template will not put the current node to output HTML. The template will put only the content of this node if it exists.

## ctx.mod(key[, value[, force]])

This class method returns/sets a modifier depending on arguments. Use **force** to set the modifier even if it was specified earlier.

```javascript
bh.match('input', function(ctx) {
    ctx.mod('native', 'yes');
    ctx.mod('disabled', true);
});

bh.match('input_islands_yes', function(ctx) {
    ctx.mod('native', '', true);
    ctx.mod('disabled', false, true);
});
```

## ctx.mods([values[, force]])

This class method returns/sets modifiers depending on arguments. Use **force** to set the modifiers even if they were specified earlier.

```javascript
bh.match('paranja', function(ctx) {
    ctx.mods({
        theme: 'normal',
        disabled: true
    });
});
```

## ctx.attr(key[, value[, force]])

This class method returns/sets an attribute depending on arguments. Use **force** to set the attribute even if it was specified earlier.

```javascript
bh.match('input_disabled_yes', function(ctx) {
    ctx.attr('disabled', 'disabled');
});
```

*NB*: If an attribute is needed to be deleted and not nulled in its value, you have to pass `null` as a second parameter:

```javascript
bh.match('link', function(ctx) {
    ctx.attr('href', null);
});
```

## ctx.attrs([values[, force]])

This class method returns/sets attributes depending on arguments. Use **force** to set the attributes even if they were specified earlier.

```javascript
bh.match('input', function(ctx) {
    ctx.attrs({
        name: ctx.param('name'),
        autocomplete: 'off'
    });
});
```

## ctx.mix([value[, force]])

This class method returns/sets a mix value depending on arguments.

Use **force** to set the attribute even if it was specified earlier.

If **force** has `true` value, the specified mix replaces the previous value, otherwise the both mixes are added.

```javascript
bh.match('button_pseudo_yes', function(ctx) {
    ctx.mix({ block: 'link', mods: { pseudo: 'yes' } });
    ctx.mix([
        { elem: 'text' },
        { block: 'ajax' }
    ]);
});
```

## ctx.bem([value[, force]])

This class method returns/sets `bem` value depending on arguments. Use **force** to set the `bem` value even if it was specified earlier.

If `bem` has `false` value, any BEM classes will not be generated for an element.

```javascript
bh.match('meta', function(ctx) {
    ctx.bem(false);
});
```

## ctx.js([value[, force]])

This class method returns/sets `js` value depending on arguments. Use **force** to set the `js` value even if it was specified earlier.

Use `js` value for blocks initialization in browser by `BEM.DOM.init()`.

```javascript
bh.match('input', function(ctx) {
    ctx.js(true);
});
```

## ctx.cls([value[, force]])

This class method returns/sets CSS class value depending on arguments.

```javascript
bh.match('page', function(ctx) {
    ctx.cls('ua_js_no ua_css_standard');
});
```

## ctx.content([value[, force]])

This class method returns/sets a content depending on arguments. Use **force** to set the content even if it was specified earlier.

```javascript
bh.match('input', function(ctx) {
    ctx.content({ elem: 'control' });
});
```

## ctx.json()

Returns the current section of BEMJSON tree. You could use this class method with `return` method for wrapping. For brevity, you can use the second argument of the template function – `json`.

*NB*: The call of `ctx.applyBase()` function breaks the chain of consistent templates application. This causes the case when `json` stops to point out the current node in BEMJSON tree. To avoid this you must use `ctx.json()` method.

```javascript
bh.match('input', function(ctx, json) {
    return {
        elem: 'wrapper',
        attrs: { name: json.name },
        content: ctx.json()
    };
});
```

## ctx.position()
## ctx.isFirst()
## ctx.isLast()

**ctx.position()** returns the position of the current BEMJSON element within parental element.
**ctx.isFirst()** returns `true` if the current BEMJSON element is the first within the parental BEMJSON element.
**ctx.isLast()** returns `true` if the current BEMJSON element is the last within the parental BEMJSON element.

For example:

```javascript
bh.match('list__item', function(ctx) {
    ctx.mod('pos', ctx.position());
    if (ctx.isFirst()) {
        ctx.mod('first', 'yes');
    }
    if (ctx.isLast()) {
        ctx.mod('last', 'yes');
    }
});
```

## ctx.isSimple()

Verifies that object is a primitive.

```javascript
bh.match('link', function(ctx) {
    ctx.tag(ctx.isSimple(ctx.content()) ? 'span' : 'div');
});
```

## ctx.extend()

This class method is analogue of `extend` function in jQuery.

## ctx.applyBase()

This class method converts the BEMJSON element by another templates. For example, it could be used to add the element in the end of the content after all other elements that are added in the end by base templates.

For example:

```javascript
bh.match('header', function(ctx) {
   ctx.content([
       ctx.content(),
       { elem: 'under' }
   ], true);
});

bh.match('header_float_yes', function(ctx) {
   ctx.applyBase();
   ctx.content([
       ctx.content(),
       { elem: 'clear' }
   ], true);
});
```

## ctx.stop()

This class method stops application of other templates for BEMJSON element.

For example:

```javascript
bh.match('button', function(ctx) {
    ctx.tag('button', true);
});
bh.match('button', function(ctx) {
    ctx.tag('span');
    ctx.stop();
});
```

## ctx.generateId()

This class method returns the unique identifier. For example, you can use it to set the correspondence between `label` and` input`.

## ctx.param(key[, value[, force]])

This class method returns/sets parameter of the current BEMJSON element. Use **force** to set the parameter value even if it was specified earlier.

For example:

```javascript
bh.match('search', function(ctx) {
    ctx.attr('action', ctx.param('action') || '/');
});
```

## ctx.tParam(key[, value])

This class method passes a parameter into BEMJSON tree. Use **force** to set the parameter value even if it was specified earlier.

```javascript
bh.match('input', function(ctx) {
    ctx.content({ elem: 'control' });
    ctx.tParam('value', ctx.param('value'));
});

bh.match('input__control', function(ctx) {
    ctx.attr('value', ctx.tParam('value'));
});
```
