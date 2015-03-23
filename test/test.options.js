var BH = require('../lib/bh');
require('chai').should();

describe('options', function() {
    describe('jsAttr', function() {
        var bh;
        beforeEach(function() {
            bh = new BH();
        });

        it('should use onclick and js format as default', function() {
            bh.apply({ block: 'button', js: true }).should.equal(
                '<div class="button i-bem" onclick=\'return {"button":{}}\'></div>'
            );
        });

        it('should return current options', function() {
            bh.setOptions({ foo: 'bar' });
            bh.getOptions().foo.should.equal('bar');
        });

        it('should use js format as default and use jsAttrName option', function() {
            bh.setOptions({
                jsAttrName: 'ondblclick'
            });
            bh.apply({ block: 'button', js: true }).should.equal(
                '<div class="button i-bem" ondblclick=\'return {"button":{}}\'></div>'
            );
        });

        it('should use onclick as default and use jsAttrScheme option', function() {
            bh.setOptions({
                jsAttrScheme: 'json'
            });
            bh.apply({ block: 'button', js: true }).should.equal(
                '<div class="button i-bem" onclick=\'{"button":{}}\'></div>'
            );
        });

        it('should use jsAttrName and jsAttrScheme options', function() {
            bh.setOptions({
                jsAttrName: 'data-bem',
                jsAttrScheme: 'json'
            });
            bh.apply({ block: 'button', js: true }).should.equal(
                '<div class="button i-bem" data-bem=\'{"button":{}}\'></div>'
            );
        });

        it('should use jsCls option', function() {
            bh.setOptions({ jsCls: 'js' });
            bh.apply({ block: 'button', js: true }).should.equal(
                '<div class="button js" onclick=\'return {"button":{}}\'></div>'
            );
        });

        it('should use empty jsCls option', function() {
            bh.setOptions({ jsCls: false });
            bh.apply({ block: 'button', js: true }).should.equal(
                '<div class="button" onclick=\'return {"button":{}}\'></div>'
            );
        });

        it('should use clsNobaseMods options', function() {
            bh.setOptions({ clsNobaseMods: true });
            bh.apply({
                block: 'button',
                mods: { disabled: true, theme: 'new' },
                mix: [
                    { block: 'clearfix' },
                    { elem: 'box', elemMods: { pick: 'left' } }
                ],
                content: {
                    elem: 'control',
                    elemMods: { disabled: true }
                }
            }).should.equal(
                '<div class="button _disabled _theme_new clearfix button__box _pick_left">' +
                    '<div class="button__control _disabled"></div>' +
                '</div>'
            );
        });
    });
});
