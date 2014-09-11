var BH = require('../lib/bh');
require('chai').should();

describe('ctx.mix()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });
/*
    it('should apply attr from mixed items', function() {
        bh.match('input', function(ctx) {
            ctx.attr('name', 'input');
            ctx.attr('type', 'text');
        });
        bh.match('search', function(ctx) {
            ctx.attr('name', 'search');
            ctx.attr('type', 'search', true);
            ctx.attr('autocomplete', 'off');
        });
        bh.apply({ block: 'input', mix: { block: 'search' } }).should.equal(
            '<div class="input search" name="input" type="search" autocomplete="off"></div>'
        );
    });

    it('should apply attrs from mixed items', function() {
        bh.match('input', function(ctx) {
            ctx.attrs({ name: 'input' });
        });
        bh.match('search', function(ctx) {
            ctx.attrs({ name: 'search' }, true);
            ctx.attrs({ autocomplete: 'off' });
        });
        bh.apply({ block: 'input', mix: { block: 'search' } }).should.equal(
            '<div class="input search" autocomplete="off" name="search"></div>'
        );
    });

    it('should apply tag from mixed items', function() {
        bh.match('button', function(ctx) {
            ctx.tag('button');
        });
        bh.apply({ block: 'link', mix: { block: 'button' } }).should.equal(
            '<button class="link button"></button>'
        );
    });
*/
    it('should preserve own mods for mixed items', function() {
        bh.match('button', function(ctx) {
            ctx.mod('disabled', true);
        });
        bh.apply({ block: 'link', mods: { type: 'button' }, mix: { block: 'button' } }).should.equal(
            '<div class="link link_type_button button button_disabled"></div>'
        );
    });
});
