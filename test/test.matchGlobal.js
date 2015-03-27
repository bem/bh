var BH = require('../lib/bh');
require('chai').should();

describe('bh.beforeEach()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should apply beforeEach template', function() {
        bh.beforeEach(function(ctx) {
            ctx.tag('b');
            ctx.bem(false);
        });
        bh.apply([
            { content: 'foo' },
            { block: 'button' },
            { block: 'input', elem: 'control' }
        ]).should.equal('<b>foo</b><b></b><b></b>');
    });

    it('should match beforeEach before other template', function() {
        bh.match('button', function(ctx) {
            ctx.tag('button');
        });
        bh.beforeEach(function(ctx) {
            ctx.tag('span');
        });
        bh.match('button', function(ctx) {
            ctx.tag('strong');
        });

        bh.apply({ block: 'button' }).should.equal('<span class="button"></span>');
    });

    it('should apply several beforeEach templates in proper order', function() {
        bh.beforeEach(function(ctx, json) {
            json.cls += '2';
        });
        bh.beforeEach(function(ctx, json) {
            json.cls += '1';
        });
        bh.apply({ block: 'button', cls: 'foo' }).should.equal('<div class="button foo12"></div>');
    });
});

describe('bh.afterEach()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should apply afterEach template', function() {
        bh.afterEach(function(ctx) {
            ctx.tag('b');
            ctx.bem(false);
        });
        bh.apply([
            { content: 'foo' },
            { block: 'button' },
            { block: 'input', elem: 'control' }
        ]).should.equal('<b>foo</b><b></b><b></b>');
    });

    it('should match afterEach after other template', function() {
        bh.match('button', function(ctx) {
            ctx.tag('button', true);
        });
        bh.afterEach(function(ctx) {
            ctx.tag('span', true);
        });
        bh.match('button', function(ctx) {
            ctx.tag('strong', true);
        });

        bh.apply({ block: 'button' }).should.equal('<span class="button"></span>');
    });

    it('should apply several afterEach templates in proper order', function() {
        bh.afterEach(function(ctx, json) {
            json.cls += '2';
        });
        bh.afterEach(function(ctx, json) {
            json.cls += '1';
        });
        bh.apply({ block: 'button', cls: 'foo' }).should.equal('<div class="button foo12"></div>');
    });
});
