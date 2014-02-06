var BH = require('../lib/bh');
require('chai').should();

describe('bh.toHtml()', function() {
    describe('attrs', function() {
        var bh;
        beforeEach(function() {
            bh = new BH();
        });
        it('should ignore null attrs', function() {
            bh.match('button', function(ctx) {
                ctx.tag('a');
                ctx.attr('href', '#');
            });
            bh.match('button', function(ctx) {
                ctx.attr('href', null);
            });
            bh.apply({ block: 'button' }).should.equal(
                '<a class="button"></a>'
            );
        });
        it('should not ignore empty attrs', function() {
            bh.match('button', function(ctx) {
                ctx.tag('a');
                ctx.attr('href', '#');
            });
            bh.match('button', function(ctx) {
                ctx.attr('href', '');
            });
            bh.apply({ block: 'button' }).should.equal(
                '<a class="button" href=""></a>'
            );
        });
    });
    describe('mods', function() {
        var bh;
        beforeEach(function() {
            bh = new BH();
        });
        it('should ignore null mods', function() {
            bh.match('button', function(ctx) {
                ctx.tag('a');
                ctx.mod('type', 'active');
            });
            bh.match('button', function(ctx) {
                ctx.mod('type', null);
            });
            bh.apply({ block: 'button' }).should.equal(
                '<a class="button"></a>'
            );
        });
        it('should ignore empty mods', function() {
            bh.match('button', function(ctx) {
                ctx.tag('a');
                ctx.mod('type', 'active');
            });
            bh.match('button', function(ctx) {
                ctx.mod('type', '');
            });
            bh.apply({ block: 'button' }).should.equal(
                '<a class="button"></a>'
            );
        });
        it('should not ignore boolean mods', function() {
            bh.match('button', function(ctx) {
                ctx.tag('button');
                ctx.mod('disabled', 'disabled');
            });
            bh.match('button', function(ctx) {
                ctx.mod('visible', false);
                ctx.mod('disabled', true);
            });
            bh.apply({ block: 'button' }).should.equal(
                '<button class="button button_disabled"></button>'
            );
        });
    });
});
