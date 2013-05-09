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
    it('should apply another matcher', function() {
        bh.match('corners', function(ctx) {
            ctx.content([
                ctx.content(),
                { elem: 'tl' },
                { elem: 'tr' },
                { elem: 'bl' },
                { elem: 'br' }
            ], true);
        });
        bh.match('button', function(ctx) {
            ctx.tag('button');
            ctx.mix([{block: 'corners' }]);
            ctx.applyCtx({ block: 'corners' });
        });
        bh.apply({ block: 'button', content: 'Hello' }).should.equal(
            '<button class="button corners">' +
                'Hello' +
                '<div class="corners__tl"></div>' +
                '<div class="corners__tr"></div>' +
                '<div class="corners__bl"></div>' +
                '<div class="corners__br"></div>' +
            '</button>'
        );
    });

});
