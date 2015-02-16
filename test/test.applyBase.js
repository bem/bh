var BH = require('../lib/bh');
require('chai').should();

describe('ctx.applyBase()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should apply templates for new mod', function() {
        bh.match('button', function(ctx) {
            ctx.mod('type', 'span');
            ctx.applyBase();
        });
        bh.match('button_type_span', function(ctx) {
            ctx.tag('span');
        });
        bh.apply({ block: 'button' }).should.equal(
            '<span class="button button_type_span"></span>'
        );
    });

    it('should apply base matcher for element', function() {
        bh.match('button__control', function(ctx) {
            ctx.mod('type', 'span');
            ctx.applyBase();
        });
        bh.match('button__control_type_span', function(ctx) {
            ctx.tag('span');
        });
        bh.apply({ block: 'button', elem: 'control', mods: { disabled: true } }).should.equal(
            '<span class="button__control button__control_disabled button__control_type_span"></span>'
        );
    });

    it('should apply base matcher for content', function() {
        bh.match('button', function(ctx) {
            ctx.content([
                { elem: 'base-before' },
                ctx.content(),
                { elem: 'base-after' }
            ], true);
        });
        bh.match('button', function(ctx) {
            ctx.applyBase();
            ctx.content([
                { elem: 'before' },
                ctx.content(),
                { elem: 'after' }
            ], true);
        });
        bh.apply({ block: 'button', content: 'Hello' }).should.equal(
            '<div class="button">' +
                '<div class="button__before"></div>' +
                '<div class="button__base-before"></div>' +
                'Hello' +
                '<div class="button__base-after"></div>' +
                '<div class="button__after"></div>' +
            '</div>'
        );
    });

    it('should apply base matcher while wrapping', function() {
        bh.match('button', function(ctx) {
            return [
                { elem: 'base-before' },
                ctx.json(),
                { elem: 'base-after' }
            ];
        });
        bh.match('button', function(ctx) {
            ctx.applyBase();
            return [
                { elem: 'before' },
                ctx.json(),
                { elem: 'after' }
            ];
        });
        bh.apply({ block: 'button', content: 'Hello' }).should.equal(
            '<div class="button__before"></div>' +
                '<div class="button__base-before"></div>' +
                    '<div class="button">' +
                        'Hello' +
                    '</div>' +
                '<div class="button__base-after"></div>' +
            '<div class="button__after"></div>'
        );
    });

    it('should preserve tParam', function() {
        bh.match('select__control', function(ctx) {
            ctx.tParam('lol', 333);
        });
        bh.match('select', function(ctx) {
            ctx.tParam('foo', 222);
        });
        bh.match('select_disabled', function(ctx) {
            ctx.applyBase();
            ctx.tParam('bar', 111);
        });
        bh.match('select__control', function(ctx) {
            ctx.applyBase();
            (ctx.tParam('foo') + ctx.tParam('bar') + ctx.tParam('lol')).should.equal(666);
        });
        bh.apply({ block: 'select', mods: { disabled: true }, content: { elem: 'control' } });
    });

    it('should preserve position', function() {
        bh.match('button', function(ctx) {
            if (ctx.isFirst()) {
                ctx.mod('first', 'yes');
            }
            if (ctx.isLast()) {
                ctx.mod('last', 'yes');
            }
        });
        bh.match('button', function(ctx) {
            ctx.applyBase();
        });
        bh.apply([
            { block: 'button' },
            { block: 'button' },
            { block: 'button' }
        ]).should.equal(
            '<div class="button button_first_yes"></div>' +
            '<div class="button"></div>' +
            '<div class="button button_last_yes"></div>'
        );
    });
});
