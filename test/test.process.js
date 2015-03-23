var BH = require('../lib/bh');
require('chai').should();

describe('ctx.process()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should return valid processed json', function() {
        bh.match('search', function(ctx) {
            ctx.content(ctx.process({ block: 'input' }));
        });
        bh.match('input', function(ctx) {
            ctx.tag('input');
        });
        bh.apply({ block: 'search' }).should.equal(
            '<div class="search"><input class="input"/></div>'
        );
    });

    it('should return valid processed element with no block name', function() {
        bh.match('button', function(ctx) {
            ctx.content(ctx.process({ elem: 'inner' }));
        });
        bh.match('button__inner', function(ctx) {
            ctx.tag('span');
        });
        bh.apply({ block: 'button' }).should.equal(
            '<div class="button"><span class="button__inner"></span></div>'
        );
    });
});
