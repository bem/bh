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
        it('should use jsClsName option', function() {
            bh.setOptions({
                jsClsName: 'i-test'
            });
            bh.apply({ block: 'button', js: true }).should.equal(
                '<div class="button i-test" onclick="return {&quot;button&quot;:{}}"></div>'
            );
        });
    });
});
