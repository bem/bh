var BH = require('../lib/bh');
require('chai').should();

describe('json.mods', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });
    it('should match and process boolean mods', function() {
        bh.match('button_disabled', function(ctx) {
            ctx.attr('disabled', 'disabled');
        });
        bh.apply({ block: 'button', mods: { disabled: true } }).should.equal(
            '<div class="button button_disabled" disabled="disabled"></div>'
        );
    });
    it('should match and process string mods', function() {
        bh.match('button_type_link', function(ctx) {
            ctx.tag('a');
        });
        bh.apply({ block: 'button', mods: { type: 'link' } }).should.equal(
            '<a class="button button_type_link"></a>'
        );
    });
    it('should not match string values of boolean mods', function() {
        bh.match('button_type', function(ctx) {
            ctx.tag('span');
        });
        bh.apply({ block: 'button', mods: { type: 'link' } }).should.equal(
            '<div class="button button_type_link"></div>'
        );
    });
});
