var BH = require('../lib/bh');
require('chai').should();

describe('ctx.cls()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });
    it('should return cls', function() {
        bh.match('button', function(ctx) {
            ctx.cls().should.equal('btn');
        });
        bh.apply({ block: 'button', cls: 'btn' });
    });
    it('should set cls', function() {
        bh.match('button', function(ctx) {
            ctx.cls('btn');
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button btn"></div>');
    });
    it('should escape cls', function() {
        bh.match('button', function(ctx) {
            ctx.cls('url="a=b&c=d"');
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button url=&quot;a=b&amp;c=d&quot;"></div>');
    });
    it('should escape BEM cls', function() {
        bh.match('button\\"1', function(ctx) {
            ctx.cls('btn"1');
        });
        bh.match('button\\"1__elem"1', function(ctx) {
            ctx.cls('elem"1');
        });
        bh.apply({ block: 'button\\"1', content: { elem: 'elem"1' } })
            .should.equal(
                '<div class="button\\&quot;1 btn&quot;1"><div class="button\\&quot;1__elem&quot;1 elem&quot;1"></div></div>'
            );
    });
    it('should not override user cls', function() {
        bh.match('button', function(ctx) {
            ctx.cls('btn');
        });
        bh.apply({ block: 'button', cls: 'user-btn' }).should.equal('<div class="button user-btn"></div>');
    });
    it('should not override later declarations', function() {
        bh.match('button', function(ctx) {
            ctx.cls('control');
        });
        bh.match('button', function(ctx) {
            ctx.cls('btn');
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button btn"></div>');
    });
    it('should override later declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.cls('control', true);
        });
        bh.match('button', function(ctx) {
            ctx.cls('btn');
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button control"></div>');
    });
    it('should override user declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.cls('btn', true);
        });
        bh.apply({ block: 'button', cls: 'user-btn' }).should.equal('<div class="button btn"></div>');
    });
});
