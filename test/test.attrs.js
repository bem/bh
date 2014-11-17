var BH = require('../lib/bh');
require('chai').should();

describe('ctx.attrs()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should return empty attrs', function() {
        bh.match('button', function(ctx) {
            Object.keys(ctx.attrs()).length.should.equal(0);
        });
        bh.apply({ block: 'button' });
    });

    it('should return attrs', function() {
        bh.match('button', function(ctx) {
            ctx.attrs().type.should.equal('button');
        });
        bh.apply({ block: 'button', attrs: { type: 'button' } });
    });

    it('should set attrs', function() {
        bh.match('checkbox', function(ctx) {
            ctx.attrs({
                type: 'button',
                disabled: false,
                name: undefined
            });
        });
        bh.apply({ block: 'checkbox' }).should.equal('<div class="checkbox" type="button" disabled="false"></div>');
    });

    it('should not override user attrs', function() {
        bh.match('button', function(ctx) {
            ctx.attrs({
                type: 'button',
                disabled: true
            });
        });
        bh.apply({
            block: 'button',
            attrs: {
                type: 'link',
                disabled: undefined,
                name: 'button'
            }
        }).should.equal('<div class="button" type="link" name="button"></div>');
    });

    it('should not override later declarations', function() {
        bh.match('button', function(ctx) {
            ctx.attrs({ type: 'control', tabindex: 0 });
        });
        bh.match('button', function(ctx) {
            ctx.attrs({ type: 'button' });
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button" type="button" tabindex="0"></div>');
    });

    it('should override later declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.attrs({ type: 'control' }, true);
        });
        bh.match('button', function(ctx) {
            ctx.attrs({ type: 'button', tabindex: 0 });
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button" type="control" tabindex="0"></div>');
    });

    it('should override user declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.attrs({
                type: 'button',
                disabled: undefined
            }, true);
        });
        bh.apply({
            block: 'button',
            attrs: {
                type: 'link',
                disabled: 'disabled',
                name: 'button'
            }
        }).should.equal('<div class="button" type="button" name="button"></div>');
    });
});
