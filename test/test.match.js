var BH = require('../lib/bh');
require('chai').should();

describe('bh.match()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should allow to use chaining', function() {
        bh.match('button', function() {}).should.eql(bh);
    });

    it('should allow to use a few matchers in one call', function() {
        bh.match({
            'button': function(ctx) {
                ctx.tag('button');
            },

            'button_type_submit': function(ctx) {
                ctx.attr('type', 'submit');
            }
        });

        bh.apply({ block: 'button', mods: { 'type': 'submit' } }).should.equal(
            '<button class="button button_type_submit" type="submit"></button>'
        );
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
