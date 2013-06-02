var BH = require('../lib/bh');
require('chai').should();

describe('mod match shortcut', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });
    it('should match using shortcut', function() {
        bh.match('button_valid', function(ctx) {
            ctx.tag('span');
        });
        bh.apply({ block: 'button', mods: {valid: 'yes' }}).should.equal(
            '<span class="button button_valid_yes"></span>'
        );
    });
    it('should match block mod using shortcut', function() {
        bh.match('button_valid__inner', function(ctx) {
            ctx.tag('span');
        });
        bh.apply({ block: 'button', mods: { valid: 'yes' }, content: { elem: 'inner' } }).should.equal(
            '<div class="button button_valid_yes"><span class="button__inner"></span></div>'
        );
    });
});
