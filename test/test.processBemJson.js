var BH = require('../lib/bh');
require('chai').should();

// Standard:
//   EN - https://en.bem.info/technology/bemjson/v2/bemjson/
//   RU - http://ru.bem.info/technology/bemjson/

describe('bh.processBemJson', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should create empty block mods', function() {
        bh.processBemJson({
            block: 'button'
        }).should.deep.equal({
            block: 'button',
            mods: {}
        });
    });

    it('should create empty elem mods', function() {
        bh.processBemJson({
            block: 'button',
            elem: 'control'
        }).should.deep.equal({
            block: 'button',
            mods: null,
            elem: 'control',
            elemMods: {}
        });
    });

    it('should inherit block mods', function() {
        bh.processBemJson({
            block: 'button',
            mods: { disabled: true },
            content: { elem: 'inner' }
        }).should.deep.equal({
            block: 'button',
            mods: { disabled: true },
            content: {
                block: 'button',
                mods: { disabled: true },
                elem: 'inner',
                elemMods: {}
            }
        });
    });

    it('should use elemMods instead of mods if collision', function() {
        bh.processBemJson({
            block: 'button',
            mods: { valid: true },
            elem: 'inner',
            elemMods: { disabled: 'yes' }
        }).should.deep.equal({
            block: 'button',
            mods: { valid: true },
            elem: 'inner',
            elemMods: { disabled: 'yes' }
        });
    });

    it('should process a replacement node with inherited block context', function() {
        var result;
        bh.match('button__control', function() {
            return { elem: 'replacement' };
        });
        bh.match('button__replacement', function(ctx) {
            ctx.tag('span');
        });

        result = bh.processBemJson({
            block: 'button',
            content: { elem: 'control' }
        });

        result.block.should.equal('button');
        result.content.block.should.equal('button');
        result.content.elem.should.equal('replacement');
        result.content.tag.should.equal('span');
    });

    it('should leave nested content unprocessed when ignoreContent is enabled', function() {
        var result;
        bh.match('button', function(ctx) {
            ctx.tag('button');
        });
        bh.match('button__control', function(ctx) {
            ctx.tag('input');
        });

        result = bh.processBemJson({
            block: 'button',
            content: { elem: 'control' }
        }, undefined, true);

        result.tag.should.equal('button');
        result.content.should.deep.equal({ elem: 'control' });
    });
});
