var BH = require('../lib/bh');
require('chai').should();

describe('ctx.attr()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should return attr', function() {
        bh.match('button', function(ctx) {
            ctx.attr('type').should.equal('button');
        });
        bh.apply({ block: 'button', attrs: { type: 'button' } });
    });

    it('should return undefined attr', function() {
        bh.match('button', function(ctx) {
            (typeof ctx.attr('type')).should.equal('undefined');
        });
        bh.apply({ block: 'button', attrs: { disabled: 'disabled' } });
    });

    it('should set attr', function() {
        bh.match('checkbox', function(ctx) {
            ctx.attr('type', 'button');
            ctx.attr('disabled', false);
            ctx.attr('name', undefined);
            ctx.attr('value', null);
        });
        bh.apply({ block: 'checkbox' }).should.equal('<div class="checkbox" type="button" disabled="false"></div>');
    });

    it('should not override user attr', function() {
        bh.match('button', function(ctx) {
            ctx.attr('type', 'button');
            ctx.attr('disabled', true);
        });
        bh.apply({
            block: 'button',
            attrs: {
                type: 'link',
                disabled: undefined
            }
        }).should.equal('<div class="button" type="link"></div>');
    });

    it('should not override later declarations', function() {
        bh.match('button', function(ctx) {
            ctx.attr('type', 'control');
        });
        bh.match('button', function(ctx) {
            ctx.attr('type', 'button');
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button" type="button"></div>');
    });

    it('should override later declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.attr('type', 'control', true);
        });
        bh.match('button', function(ctx) {
            ctx.attr('type', 'button');
        });
        bh.apply({ block: 'button' }).should.equal('<div class="button" type="control"></div>');
    });

    it('should override user declarations with force flag', function() {
        bh.match('button', function(ctx) {
            ctx.attr('type', 'button', true);
            ctx.attr('disabled', undefined, true);
        });
        bh.apply({
            block: 'button',
            attrs: {
                type: 'link',
                disabled: 'disabled'
            }
        }).should.equal('<div class="button" type="button"></div>');
    });
});
