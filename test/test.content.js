var BH = require('../lib/bh');
require('chai').should();

describe('ctx.content()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });
    it('should return bemjson content', function() {
        bh.match('button', function(ctx) {
            ctx.content().should.equal('Hello');
        });
        bh.apply({ block: 'button', content: 'Hello' });
    });
    it('should set bemjson content', function() {
        bh.match('button', function(ctx) {
            ctx.content({ elem: 'text' });
        });
        bh.apply({ block: 'button' }).should.equal(
            '<div class="button"><div class="button__text"></div></div>');
    });
    it('should set bemjson array content', function() {
        bh.match('button', function(ctx) {
            ctx.content([{ elem: 'text1' }, { elem: 'text2' }]);
        });
        bh.apply({ block: 'button' }).should.equal(
            '<div class="button"><div class="button__text1"></div><div class="button__text2"></div></div>');
    });
    it('should set bemjson string content', function() {
        bh.match('button', function(ctx) {
            ctx.content('Hello World');
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button">Hello World</div>');
    });
    it('should set bemjson numeric content', function() {
        bh.match('button', function(ctx) {
            ctx.content(123);
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button">123</div>');
    });
    it('should set bemjson zero-numeric content', function() {
        bh.match('button', function(ctx) {
            ctx.content(0);
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button">0</div>');
    });
    it('should not override user content', function() {
        bh.match('button', function(ctx) {
            ctx.content({ elem: 'text' });
        });
        bh.apply({ block: 'button', content: 'Hello' }).should.equal('<div class="button">Hello</div>');
    });
    it('should not override later declarations', function() {
        bh.match('button', function(ctx) {
            ctx.content({ elem: 'text2' });
        });
        bh.match('button', function(ctx) {
            ctx.content({ elem: 'text1' });
        });
        bh.apply({ block: 'button' }).should.equal(
            '<div class="button"><div class="button__text1"></div></div>');
    });
    it('should override later declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.content({ elem: 'text2' }, true);
        });
        bh.match('button', function(ctx) {
            ctx.content({ elem: 'text1' });
        });
        bh.apply({ block: 'button' }).should.equal(
            '<div class="button"><div class="button__text2"></div></div>');
    });
    it('should override user declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.content('text', true);
        });
        bh.apply({ block: 'button', content: 'Hello' }).should.equal('<div class="button">text</div>');
    });
});
