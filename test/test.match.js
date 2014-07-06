var BH = require('../lib/bh');
require('chai').should();

describe('bh.match()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should not create invalid matcher', function() {
        bh.match(false, function() {});
        bh.apply('').should.equal('');
    });

    it('should allow to use chaining', function() {
        bh.match('button', function() {}).should.eql(bh);
    });

    it('should match on elem of block with modifier', function() {
        bh.match('button_disabled__control', function(ctx) {
            ctx.tag('input');
        });

        bh.apply({
            block: 'button',
            mods: { disabled: true },
            content: { elem: 'control' }
        }).should.equal('<div class="button button_disabled"><input class="button__control"/></div>');
    });

    it('should allow to use a few matchers in one call #1', function() {
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

    it('should allow to use a few matchers in one call #2', function() {
        bh.match(
            [
                'item__mark',
                'item__text'
            ],
            function(ctx) {
                ctx.tag('span');
            }
        );

        bh.apply({
            block: 'item',
            content: [
                { elem: 'mark', content: '>' },
                { elem: 'text', content: 'foobar' }
            ]
        }).should.equal(
            '<div class="item">' +
                '<span class="item__mark">></span>' +
                '<span class="item__text">foobar</span>' +
            '</div>'
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
        bh.match('button_is-bem_yes__control', function(ctx) {
            ctx.content('Hello');
        });
        bh.apply({ block: 'button', mods: { 'is-bem': 'yes' }, content: { elem: 'control' } }).should.equal(
            '<div class="button button_is-bem_yes"><div class="button__control">Hello</div></div>'
        );
    });
});
