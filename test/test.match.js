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

    it('should match string mods', function() {
        bh.match('button_type_link', function(ctx) {
            ctx.tag('a');
        });
        bh.apply({ block: 'button', mods: { type: 'link' } }).should.equal(
            '<a class="button button_type_link"></a>'
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

    it('should match boolean mods', function() {
        bh.match('button_disabled', function(ctx) {
            ctx.attr('disabled', 'disabled');
        });
        bh.apply({ block: 'button', mods: { disabled: true } }).should.equal(
            '<div class="button button_disabled" disabled="disabled"></div>'
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
