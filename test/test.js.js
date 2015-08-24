var BH = require('../lib/bh');
require('chai').should();

describe('ctx.js()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should return js', function() {
        bh.match('button', function(ctx) {
            ctx.js().should.equal(true);
        });
        bh.apply({ block: 'button', js: true });
    });

    it('should set js', function() {
        bh.match('button', function(ctx) {
            ctx.js(true);
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button i-bem" onclick="return {&quot;button&quot;:{}}"></div>');
    });

    it('should not set js', function() {
        bh.match('button', function(ctx) {
            ctx.js(false);
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button"></div>');
    });

    it('should not override user declarations', function() {
        bh.match('button', function(ctx) {
            ctx.js(true);
        });
        bh.apply({ block: 'button', js: false }).should.equal('<div class="button"></div>');
    });

    it('should extend user js', function() {
        bh.match('button', function(ctx) {
            ctx.js({ a: 2 });
        });
        bh.apply({ block: 'button', js: { x: 1 } })
            .should.equal('<div class="button i-bem" onclick="return {&quot;button&quot;:{&quot;x&quot;:1,&quot;a&quot;:2}}"></div>');
    });

    it('should extend user js, when it equal true', function() {
        bh.match('button', function(ctx) {
            ctx.js({ a: 1 });
        });
        bh.apply({ block: 'button', js: true }).should.equal('<div class="button i-bem" onclick=\'return {"button":{"a":1}}\'></div>');
    });

    it('should not override later declarations #1', function() {
        bh.match('button', function(ctx) {
            ctx.js(false);
        });
        bh.match('button', function(ctx) {
            ctx.js(true);
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button i-bem" onclick="return {&quot;button&quot;:{}}"></div>');
    });

    it('should not override later declarations #2', function() {
        bh.match('button', function(ctx) {
            ctx.js(true);
        });
        bh.match('button', function(ctx) {
            ctx.js(false);
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button"></div>');
    });

    it('should override later declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.js(true, true);
        });
        bh.match('button', function(ctx) {
            ctx.js(false);
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button i-bem" onclick="return {&quot;button&quot;:{}}"></div>');
    });

    it('should override user declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.js(false, true);
        });
        bh.apply({ block: 'button', js: { a: 1 } }).should.equal('<div class="button"></div>');
    });
});
