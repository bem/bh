var BH = require('../lib/bh');
require('chai').should();

describe('mod wildcard match shortcut', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });
    it('should match block mod using wildcard mask', function() {
        bh.match('button_type_*', function(ctx) {
            ctx.tag('button');
        });
        bh.match('button_disabled_*', function(ctx) {
            ctx.attr('disabled', 'disabled');
        });
        bh.apply({ block: 'button', mods: { type: 'button', disabled: true }}).should.equal(
            '<button class="button button_type_button button_disabled" disabled="disabled"></button>'
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
