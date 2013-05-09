var BH = require('../lib/bh');
require('chai').should();

describe('ctx.mix()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });
    it('should return mix', function() {
        var mix = [{ block: 'mix' }];
        bh.match('button', function(ctx) {
            ctx.mix().should.equal(mix);
        });
        bh.apply({ block: 'button', mix: mix });
    });
    it('should set mix', function() {
        bh.match('button', function(ctx) {
            ctx.mix([{ block: 'mix'}]);
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button mix"></div>');
    });
    it('should not override user mix', function() {
        bh.match('button', function(ctx) {
            ctx.mix([{ block: 'mix'}]);
        });
        bh.apply({ block: 'button', mix: [{ block: 'user-mix'}] }).should.equal('<div class="button user-mix"></div>');
    });
    it('should not override later declarations', function() {
        bh.match('button', function(ctx) {
            ctx.mix([{ block: 'mix2'}]);
        });
        bh.match('button', function(ctx) {
            ctx.mix([{ block: 'mix1'}]);
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button mix1"></div>');
    });
    it('should override later declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.mix([{ block: 'mix2'}], true);
        });
        bh.match('button', function(ctx) {
            ctx.mix([{ block: 'mix1'}]);
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button mix2"></div>');
    });
    it('should override user declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.mix([{ block: 'mix'}], true);
        });
        bh.apply({ block: 'button', mix: [{ block: 'user-mix'}] }).should.equal('<div class="button mix"></div>');
    });
});
