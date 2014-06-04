var BH = require('../lib/bh');
require('chai').should();

describe('mod wildcard match shortcut', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should match block_mod_*', function() {
        bh.match('button_disabled_*', function(ctx) {
            ctx.attr('disabled', 'disabled');
        });
        bh.apply({ block: 'button', mods: { disabled: true }}).should.equal(
            '<div class="button button_disabled" disabled="disabled"></div>'
        );
    });

    it('should match block_mod_*__elem', function() {
        bh.match('button_type_*__control', function(ctx) {
            ctx.tag('span');
        });
        bh.apply({ block: 'button', mods: { type: 'check' }, content: { elem: 'control' } }).should.equal(
            '<div class="button button_type_check"><span class="button__control"></span></div>'
        );
    });

    it('should match and process wildcard mask on mods', function() {
        bh.match('button__control_type_*', function(ctx) {
            ctx.tag('button');
        });
        bh.match('button__control_disabled_*', function(ctx) {
            ctx.attr('disabled', 'disabled');
        });
        bh.apply({ block: 'button', content: { elem: 'control', mods: { type: 'button', disabled: true } } }).should.equal(
            '<div class="button"><button class="button__control button__control_type_button button__control_disabled" disabled="disabled"></button></div>'
        );
    });
});
