var BH = require('../lib/bh');
require('chai').should();

describe('ctx.mods()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should return empty mods', function() {
        bh.match('button', function(ctx) {
            (typeof ctx.mods()).should.equal('object');
        });
        bh.apply({ block: 'button' });
    });

    it('should return mods', function() {
        bh.match('button', function(ctx) {
            ctx.mods().type.should.equal('button');
        });
        bh.apply({ block: 'button', mods: { type: 'button' } });
    });

    it('should return boolean mods', function() {
        bh.match('button', function(ctx) {
            ctx.mods().disabled.should.equal(true);
        });
        bh.apply({ block: 'button', mods: { disabled: true } });
    });

    it('should set mods', function() {
        bh.match('button', function(ctx) {
            ctx.mods({ type: 'button', disabled: true });
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button button_type_button button_disabled"></div>');
    });

    it('should not override user mods', function() {
        bh.match('button', function(ctx) {
            ctx.mods({
                type: 'button',
                disabled: true
            });
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
            ctx.mods({ type: 'control' });
        });
        bh.match('button', function(ctx) {
            ctx.mods({ type: 'button', disabled: true });
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button button_type_button button_disabled"></div>');
    });

    it('should override later declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.mods({ type: 'control' }, true);
        });
        bh.match('button', function(ctx) {
            ctx.mods({ type: 'button' });
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button button_type_control"></div>');
    });

    it('should override user declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.mods({ type: 'button' }, true);
        });
        bh.apply({ block: 'button', mods: { type: 'link' } }).should.equal('<div class="button button_type_button"></div>');
    });
});
