var BH = require('../lib/bh');
require('chai').should();

describe('ctx.bem()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });
    it('should return bem by default', function() {
        bh.match('button', function(ctx) {
            (typeof ctx.bem()).should.equal('undefined');
        });
        bh.apply({ block: 'button' });
    });
    it('should set bem to false', function() {
        bh.match('button', function(ctx) {
            ctx.bem(false);
        });
        bh.apply({ block: 'button' }).should.equal('<div></div>');
    });
    it('should not override user bem', function() {
        bh.match('button', function(ctx) {
            ctx.bem(false);
        });
        bh.apply({ block: 'button', bem: true })
            .should.equal('<div class="button"></div>');
    });
    it('should not override later declarations', function() {
        bh.match('button', function(ctx) {
            ctx.bem(false);
        });
        bh.match('button', function(ctx) {
            ctx.bem(true);
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button"></div>');
    });
    it('should override later declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.bem(false, true);
        });
        bh.match('button', function(ctx) {
            ctx.bem(true);
        });
        bh.apply({ block: 'button' }).should.equal('<div></div>');
    });
    it('should override user declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.bem(false, true);
        });
        bh.apply({ block: 'button', bem: true }).should.equal('<div></div>');
    });
});
