var BH = require('../lib/bh');
require('chai').should();

describe('ctx.mix()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should return mix', function() {
        var mix = [{ block: 'mix' }];
        bh.match('button', function(ctx) {
            ctx.mix().should.equal(mix);
        });
        bh.apply({ block: 'button', mix: mix });
    });

    it('should set mix', function() {
        bh.match('button', function(ctx) {
            ctx.mix([{ block: 'mix' }]);
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button mix"></div>');
    });

    it('should set single mix', function() {
        bh.match('button', function(ctx) {
            ctx.mix({ block: 'mix' });
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button mix"></div>');
    });

    it('should extend single mix', function() {
        bh.match('button', function(ctx) {
            ctx.mix({ block: 'mix2' });
        });
        bh.apply({ block: 'button', mix: { block: 'mix1' } })
            .should.equal('<div class="button mix1 mix2"></div>');
    });

    it('should extend user mix', function() {
        bh.match('button', function(ctx) {
            ctx.mix([{ block: 'mix' }]);
        });
        bh.apply({ block: 'button', mix: [{ block: 'user-mix' }] })
            .should.equal('<div class="button user-mix mix"></div>');
    });

    it('should extend later declarations', function() {
        bh.match('button', function(ctx) {
            ctx.mix([{ block: 'mix2' }]);
        });
        bh.match('button', function(ctx) {
            ctx.mix([{ block: 'mix1' }]);
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button mix1 mix2"></div>');
    });

    it('should override later declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.mix([{ block: 'mix2' }], true);
        });
        bh.match('button', function(ctx) {
            ctx.mix([{ block: 'mix1' }]);
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button mix2"></div>');
    });

    it('should override user declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.mix([{ block: 'mix' }], true);
        });
        bh.apply({ block: 'button', mix: [{ block: 'user-mix' }] })
            .should.equal('<div class="button mix"></div>');
    });

    it('should inherit block name', function() {
        bh.match('button', function(ctx) {
            ctx.mix([
                { mods: { disabled: true } },
                { elem: 'input', mods: { active: true } },
                { block: 'clearfix' }
            ]);
        });
        bh.apply({ block: 'button' }).should.equal(
            '<div class="button button_disabled button__input button__input_active clearfix"></div>'
        );
    });

    it('should inherit element name', function() {
        bh.match('button__control', function(ctx) {
            ctx.mix([
                { mods: { disabled: true } },
                { elem: 'input', mods: { active: true } },
                { block: 'clearfix' }
            ]);
        });
        bh.apply({ block: 'button', elem: 'control' }).should.equal(
            '<div class="button__control button__control_disabled button__input button__input_active clearfix"></div>'
        );
    });
});
