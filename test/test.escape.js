var BH = require('../lib/bh');
require('chai').should();

describe('bh.xmlEscape()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should escape xml string', function() {
        bh.match('button', function(ctx) {
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
        bh.match('button', function(ctx) {
            bh.attrEscape('<b id="a">&</b>').should.equal('&lt;b id=&quot;a&quot;&gt;&amp;&lt;/b&gt;');
        });
        bh.apply({ block: 'button' });
    });
});
