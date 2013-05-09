var BH = require('../lib/bh');
require('chai').should();

describe('ctx.applyCtx()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
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
            ctx.applyCtx();
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
            ctx.applyCtx();
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
    it('should return valid processed element with no block name', function() {
        bh.match('button', function(ctx) {
            var inner = ctx.apply({ elem: 'inner' });
            inner.tag.should.equal('span');
            ctx.content(inner);
        });
        bh.match('button__inner', function(ctx) {
            ctx.tag('span');
        });
        bh.apply({ block: 'button' }).should.equal(
            '<div class="button">' +
                '<span class="button__inner"></span>' +
            '</div>'
        );
    });
});
