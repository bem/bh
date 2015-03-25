var BH = require('../lib/bh');
require('chai').should();

describe('bh.xmlEscape()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should escape xml string', function() {
        bh.match('button', function() {
            bh.xmlEscape('<b>&</b>').should.equal('&lt;b&gt;&amp;&lt;/b&gt;');
        });
        bh.apply({ block: 'button' });
    });
});

describe('bh.attrEscape()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should escape xml attr string', function() {
        bh.match('button', function() {
            bh.attrEscape('<b id="a">&</b>').should.equal('<b id=&quot;a&quot;>&amp;</b>');
        });
        bh.apply({ block: 'button' });
    });
});

describe('bh.jsAttrEscape()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should escape xml attr js string', function() {
        bh.match('button', function() {
            bh.jsAttrEscape('<b id="a">\'&\'</b>').should.equal('<b id="a">&#39;&amp;&#39;</b>');
        });
        bh.apply({ block: 'button' });
    });
});
