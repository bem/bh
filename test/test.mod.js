var BH = require('../lib/bh');
require('chai').should();

describe('ctx.mod()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should return mod', function() {
        bh.match('button', function(ctx) {
            ctx.mod('type').should.equal('button');
        });
        bh.apply({ block: 'button', mods: { type: 'button' } });
    });

    it('should return undefined mod', function() {
        bh.match('button', function(ctx) {
            (typeof ctx.mod('type')).should.equal('undefined');
        });
        bh.apply({ block: 'button', mods: { disabled: true } });
    });

    it('should return boolean mod', function() {
        bh.match('button', function(ctx) {
            ctx.mod('disabled').should.equal(true);
        });
        bh.apply({ block: 'button', mods: { disabled: true } });
    });

    it('should set mod', function() {
        bh.match('button', function(ctx) {
            ctx.mod('type', 'button');
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button button_type_button"></div>');
    });

    it('should set boolean mod', function() {
        bh.match('button', function(ctx) {
            ctx.mod('disabled', true);
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button button_disabled"></div>');
    });

    it('should not override user mod', function() {
        bh.match('button', function(ctx) {
            ctx.mod('type', 'button');
            ctx.mod('disabled', true);
        });
        bh.apply({
            block: 'button',
            mods: {
                type: 'link',
                disabled: undefined
            }
        }).should.equal('<div class="button button_type_link"></div>');
    });

    it('should not override later declarations', function() {
        bh.match('button', function(ctx) {
            ctx.mod('type', 'control');
        });
        bh.match('button', function(ctx) {
            ctx.mod('type', 'button');
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button button_type_button"></div>');
    });

    it('should override later declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.mod('type', 'control', true);
        });
        bh.match('button', function(ctx) {
            ctx.mod('type', 'button');
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button button_type_control"></div>');
    });

    it('should override user declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.mod('type', 'button', true);
            ctx.mod('disabled', undefined, true);
        });
        bh.apply({
            block: 'button',
            mods: {
                type: 'link',
                disabled: true
            }
        }).should.equal('<div class="button button_type_button"></div>');
    });
});
