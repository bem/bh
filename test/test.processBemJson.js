var BH = require('../lib/bh');
require('chai').should();

// Standart: http://ru.bem.info/technology/bemjson/

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
            elemMods: { disabled: 'yes' },
        }).should.deep.equal({
            block: 'button',
            mods: { valid: true },
            elem: 'inner',
            elemMods: { disabled: 'yes' }
        });
    });
});
