var BH = require('../lib/bh');
require('chai').should();

describe('ctx.apply()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should return empty string on undefined bemjson', function() {
        bh.apply().should.equal('');
    });

    it('should return valid processed element', function() {
        bh.match('button', function(ctx) {
            var inner = ctx.apply({ block: 'button', elem: 'inner' });
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
