var BH = require('../lib/bh');
require('chai').should();

describe('ctx.attr()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });
    it('should return attr', function() {
        bh.match('button', function(ctx) {
            ctx.attr('type').should.equal('button');
        });
        bh.apply({ block: 'button', attrs: {type: 'button'} });
    });
    it('should set attr', function() {
        bh.match('button', function(ctx) {
            ctx.attr('type', 'button');
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button" type="button"></div>');
    });
    it('should not override user attr', function() {
        bh.match('button', function(ctx) {
            ctx.attr('type', 'button');
        });
        bh.apply({ block: 'button', attrs: {type: 'link'} }).should.equal('<div class="button" type="link"></div>');
    });
    it('should not override later declarations', function() {
        bh.match('button', function(ctx) {
            ctx.attr('type', 'control');
        });
        bh.match('button', function(ctx) {
            ctx.attr('type', 'button');
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button" type="button"></div>');
    });
    it('should override later declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.attr('type', 'control', true);
        });
        bh.match('button', function(ctx) {
            ctx.attr('type', 'button');
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button" type="control"></div>');
    });
    it('should override user declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.attr('type', 'button', true);
        });
        bh.apply({ block: 'button', attrs: {type: 'link'} }).should.equal('<div class="button" type="button"></div>');
    });
});
