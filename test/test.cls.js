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
