var BH = require('../lib/bh');
require('chai').should();

describe('options', function() {
    var bh;

    beforeEach(function() {
        bh = new BH();
    });

    it('should return current options', function() {
        bh.setOptions({ foo: 'bar' });
        bh.getOptions().foo.should.equal('bar');
    });

    it('should use extended short tags', function() {
        bh.setOptions({ shortTags: ['rect'] });
        bh.apply({ tag: 'rect' }).should.equal('<rect/>');
    });

    it('shoud not render trailing slash for short tags', function() {
        bh.setOptions({ xhtml: false });
        bh.apply({ tag: 'br' }).should.equal('<br>');
    });

    describe('js related attrs and names', function() {
        it('should use onclick and js format as default', function() {
            bh.apply({ block: 'button', js: true }).should.equal(
                '<div class="button i-bem" onclick=\'return {"button":{}}\'></div>'
            );
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

        it('should use jsElem option', function() {
            bh.setOptions({ jsElem: false });
            bh.apply({ block: 'button', elem: 'box', js: true }).should.equal(
                '<div class="button__box" onclick=\'return {"button__box":{}}\'></div>'
            );
        });

        it('should use jsElem option for mixed element', function() {
            bh.setOptions({ jsElem: false });
            bh.apply({ block: 'button', elem: 'box', mix: { block: 'icon', elem: 'wrap', js: true } }).should.equal(
                '<div class="button__box icon__wrap" onclick=\'return {"icon__wrap":{}}\'></div>');
        });
    });

    describe('custom bem syntax', function() {
        var button;

        beforeEach(function() {
            button = {
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
            };
        });

        it('should use clsNobaseMods options', function() {
            bh.setOptions({ clsNobaseMods: true });
            bh.apply(button).should.equal(
                '<div class="button _disabled _theme_new clearfix button__box _pick_left">' +
                    '<div class="button__control _disabled"></div>' +
                '</div>'
            );
        });

        it('should use delimElem option', function() {
            bh.setOptions({ delimElem: '--' });
            bh.apply(button).should.equal(
                '<div class="button button_disabled button_theme_new clearfix button--box button--box_pick_left">' +
                    '<div class="button--control button--control_disabled"></div>' +
                '</div>'
            );
        });

        it('should use delimMod option', function() {
            bh.setOptions({ delimMod: '-' });
            bh.apply(button).should.equal(
                '<div class="button button-disabled button-theme-new clearfix button__box button__box-pick-left">' +
                    '<div class="button__control button__control-disabled"></div>' +
                '</div>'
            );
        });
    });
});
