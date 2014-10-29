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

    it('should return tParam value in nested block', function() {
        bh.match('button', function(ctx) {
            ctx.tParam('name', 'sample-name');
        });
        bh.match('input', function(ctx) {
            ctx.tParam('name').should.equal('sample-name');
        });
        bh.apply({ block: 'button', content: { block: 'input' } });
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

    it('should not override later declarations', function() {
        bh.match('button', function(ctx) {
            ctx.tParam('foo', 1);
        });
        bh.match('button', function(ctx) {
            ctx.tParam('foo', 2);
        });
        bh.match('button__control', function(ctx) {
            ctx.tParam('foo').should.equal(2);
        });
        bh.apply({ block: 'button', content: { elem: 'control' } });
    });

    it('should override later declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.tParam('foo', 1, true);
        });
        bh.match('button', function(ctx) {
            ctx.tParam('foo', 2);
        });
        bh.match('button__control', function(ctx) {
            ctx.tParam('foo').should.equal(1);
        });
        bh.apply({ block: 'button', content: { elem: 'control' } });
    });
});
