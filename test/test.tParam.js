var BH = require('../lib/bh');
require('chai').should();

describe('ctx.tParam()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should return tParam value in nested element', function() {
        bh.match('button', function(ctx) {
            ctx.tParam('name', 'sample-name');
        });
        bh.match('button__inner', function(ctx) {
            ctx.tParam('name').should.equal('sample-name');
        });
        bh.apply({ block: 'button', content: { elem: 'inner' } });
    });

    it('should return tParam value in sub-nested element', function() {
        bh.match('button', function(ctx) {
            ctx.tParam('name', 'sample-name');
        });
        bh.match('button__sub-inner', function(ctx) {
            ctx.tParam('name').should.equal('sample-name');
        });
        bh.apply({ block: 'button', content: { elem: 'inner', content: { elem: 'sub-inner' } } });
    });

    it('should not return tParam value in non-nested element', function() {
        bh.match('button', function(ctx) {
            ctx.tParam('name', 'sample-name');
        });
        bh.match('input', function(ctx) {
            (ctx.tParam('name') === undefined).should.equal(true);
        });
        bh.apply([{ block: 'button' }, { block: 'input' }]);
    });
});
