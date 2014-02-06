var BH = require('../lib/bh');
require('chai').should();

describe('json.elemMods', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });
    it('should match and process boolean elemMods', function() {
        bh.match('button__inner_valid', function(ctx) {
            ctx.tag('span');
        });
        bh.apply({ block: 'button', content: { elem: 'inner', elemMods: { valid: true } } }).should.equal(
            '<div class="button"><span class="button__inner button__inner_valid"></span></div>'
        );
    });
    it('should match and process string elemMods', function() {
        bh.match('button__inner_valid_yes', function(ctx) {
            ctx.tag('span');
        });
        bh.apply({ block: 'button', content: { elem: 'inner', elemMods: { valid: 'yes' } } }).should.equal(
            '<div class="button"><span class="button__inner button__inner_valid_yes"></span></div>'
        );
    });
    it('should not match string values of boolean elemMods', function() {
        bh.match('button__inner_valid', function(ctx) {
            ctx.tag('span');
        });
        bh.apply({ block: 'button', content: { elem: 'inner', elemMods: { valid: 'valid' } } }).should.equal(
            '<div class="button"><div class="button__inner button__inner_valid_valid"></div></div>'
        );
    });
});
