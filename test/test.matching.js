var BH = require('../lib/bh');
require('chai').should();

describe('matching', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });
    it('should not fail on non-identifier mods', function() {
        bh.match('button_is-bem_yes', function(ctx) {
            ctx.content('Hello');
        });
        bh.apply({ block: 'button', mods: { 'is-bem': 'yes' } }).should.equal(
            '<div class="button button_is-bem_yes">Hello</div>'
        );
    });
});
