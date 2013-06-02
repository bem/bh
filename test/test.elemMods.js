var BH = require('../lib/bh');
require('chai').should();

describe('json.elemMods -> json.mods', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });
    it('should match and process elemMods', function() {
        bh.match('button__inner_valid_yes', function(ctx) {
            ctx.tag('span');
        });
        bh.apply({ block: 'button', content: { elem: 'inner', elemMods: { valid: 'yes' } } }).should.equal(
            '<div class="button"><span class="button__inner button__inner_valid_yes"></span></div>'
        );
    });
});
