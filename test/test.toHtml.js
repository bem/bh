var BH = require('../lib/bh');
require('chai').should();

describe('bh.toHtml()', function() {
    describe('content', function() {
        var bh;
        beforeEach(function() {
            bh = new BH();
        });
        it('should return empty content #1', function() {
            bh.apply([
                false,
                null,
                undefined,
                [],
                '',
                { content: false }, // `div` is here
                { tag: false }
            ]).should.equal('<div></div>');
        });
    });

    describe('tags', function() {
        var bh;
        beforeEach(function() {
            bh = new BH();
        });
        it('should return html tag <div> by default', function() {
            bh.apply({}).should.equal('<div></div>');
        });
        it('should return html tag <span>', function() {
            bh.apply({ tag: 'span' }).should.equal('<span></span>');
        });
        it('should return content when `tag` is empty', function() {
            bh.apply({ tag: false, content: 'label' }).should.equal('label');
        });
    });

    describe('attrs', function() {
        var bh;
        beforeEach(function() {
            bh = new BH();
        });
        it('should ignore null attrs', function() {
            bh.match('button', function(ctx) {
                ctx.tag('a');
                ctx.attr('href', '#');
            });
            bh.match('button', function(ctx) {
                ctx.attr('href', null);
            });
            bh.apply({ block: 'button' }).should.equal(
                '<a class="button"></a>'
            );
        });
        it('should not ignore empty attrs', function() {
            bh.match('button', function(ctx) {
                ctx.tag('a');
                ctx.attr('href', '#');
            });
            bh.match('button', function(ctx) {
                ctx.attr('href', '');
            });
            bh.apply({ block: 'button' }).should.equal(
                '<a class="button" href=""></a>'
            );
        });
        it('should escape attrs', function() {
            bh.apply({
                tag: 'a',
                attrs: { href: '<script type="javascript">window && alert(document.cookie)</script>' },
                content: 'link'
            }).should.equal(
                '<a href="&lt;script type=&quot;javascript&quot;&gt;window &amp;&amp; ' +
                'alert(document.cookie)&lt;/script&gt;">link</a>');
        });
    });

    describe('mods', function() {
        var bh;
        beforeEach(function() {
            bh = new BH();
        });
        it('should ignore null mods', function() {
            bh.match('button', function(ctx) {
                ctx.tag('a');
                ctx.mod('type', 'active');
            });
            bh.match('button', function(ctx) {
                ctx.mod('type', null);
            });
            bh.apply({ block: 'button' }).should.equal(
                '<a class="button"></a>'
            );
        });
        it('should ignore empty mods', function() {
            bh.match('button', function(ctx) {
                ctx.tag('a');
                ctx.mod('type', 'active');
            });
            bh.match('button', function(ctx) {
                ctx.mod('type', '');
            });
            bh.apply({ block: 'button' }).should.equal(
                '<a class="button"></a>'
            );
        });
        it('should not ignore boolean mods', function() {
            bh.match('button', function(ctx) {
                ctx.tag('button');
                ctx.mod('disabled', 'disabled');
            });
            bh.match('button', function(ctx) {
                ctx.mod('visible', false);
                ctx.mod('disabled', true);
            });
            bh.apply({ block: 'button' }).should.equal(
                '<button class="button button_disabled"></button>'
            );
        });
    });

    describe('mix', function() {
        var bh;
        beforeEach(function() {
            bh = new BH();
        });
        it('should not set undefined mix', function() {
            bh.apply({
                block: 'button',
                mix: [null, undefined]
            }).should.equal('<div class="button"></div>');
        });
        it('should set elem mix', function() {
            bh.match('button', function(ctx) {
                ctx.mix({ elem: 'mix' });
            });
            bh.apply({ block: 'button' }).should.equal('<div class="button button__mix"></div>');
        });
        it('should set mods mix', function() {
            bh.match('button', function(ctx) {
                ctx.mix({ mods: { disabled: true, theme: 'normal' } });
            });
            bh.apply({ block: 'button' }).should.equal(
                '<div class="button button_disabled button_theme_normal"></div>'
            );
        });
        it('should set elem mods mix', function() {
            bh.match('button', function(ctx) {
                ctx.mix({ elem: 'control', mods: { disabled: true } });
            });
            bh.apply({ block: 'button' }).should.equal(
                '<div class="button button__control button__control_disabled"></div>'
            );
        });
        it('should set elem elemMods mix', function() {
            bh.match('button', function(ctx) {
                ctx.mix({ elem: 'control', elemMods: { disabled: true } });
            });
            bh.apply({ block: 'button' }).should.equal(
                '<div class="button button__control button__control_disabled"></div>'
            );
        });
        it('should set several mixes', function() {
            bh.match('button', function(ctx) {
                ctx.mix([
                    { block: 'link' },
                    { elem: 'control' },
                    { mods: { disabled: true } },
                    { block: 'label', elem: 'first', mods: { color: 'red' } }
                ]);
            });
            bh.apply({ block: 'button' }).should.equal(
                '<div class="button link button__control button_disabled label__first label__first_color_red"></div>'
            );
        });
    });

    describe('js', function()  {
        var bh;
        beforeEach(function() {
            bh = new BH();
        });
        it('should set onclick attribute, when js mode is true', function() {
            bh.match('button', function(ctx) {
                ctx.js(true);
            });
            bh.apply({ block: 'button' }).should.equal(
                '<div class="button i-bem" onclick="return {&quot;button&quot;:{}}"></div>'
            );
        });
        it('should not set onclick attribute, when bem mode is false', function() {
            bh.match('button', function(ctx) {
                ctx
                    .bem(false)
                    .js(true);
            });
            bh.apply({ block: 'button' }).should.equal(
                '<div></div>'
            );
        });
    });
});
