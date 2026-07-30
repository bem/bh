var BH = require('../lib/bh');
require('chai').should();

describe('ctx.position()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });
    it('should calculate positions for sibling elements', function() {
        bh.match('button__inner', function(ctx) {
            ctx.mod('pos', ctx.position());
        });
        bh.apply({
            block: 'button',
            content: [{ elem: 'inner' }, { elem: 'inner' }, { elem: 'inner' }]
        }).should.equal(
            '<div class="button">' +
            '<div class="button__inner button__inner_pos_1"></div>' +
            '<div class="button__inner button__inner_pos_2"></div>' +
            '<div class="button__inner button__inner_pos_3"></div>' +
            '</div>'
        );
    });
    it('should calculate positions after flattening nested arrays', function() {
        bh.match('button__inner', function(ctx) {
            ctx.mod('pos', ctx.position());
        });
        bh.apply({
            block: 'button',
            content: [
                [{ elem: 'inner' }],
                [{ elem: 'inner' }, [{ elem: 'inner' }]]
            ]
        }).should.equal(
            '<div class="button">' +
            '<div class="button__inner button__inner_pos_1"></div>' +
            '<div class="button__inner button__inner_pos_2"></div>' +
            '<div class="button__inner button__inner_pos_3"></div>' +
            '</div>'
        );
    });
    it('should return the first position for a single content element', function() {
        bh.match('button__inner', function(ctx) {
            ctx.mod('pos', ctx.position());
        });
        bh.apply({ block: 'button', content: { elem: 'inner' } }).should.equal(
            '<div class="button">' +
            '<div class="button__inner button__inner_pos_1"></div>' +
            '</div>'
        );
    });
});
