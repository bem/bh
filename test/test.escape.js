var BH = require('../lib/bh');
require('chai').should();

describe('bh.xmlEscape()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should match and make unescape xml string: &amp', function() {
        bh.match('suggest-item', function(ctx) {
            ctx.content(bh.xmlEscape(ctx.content()), true);
        });

        bh.apply({
            block: 'suggest-item',
            content: "a&b"
        }).should.equal('<div class="suggest-item">a&amp;b</div>');
    });

    it('should match and make unescape xml string: &lt', function() {
        bh.match('suggest-item', function(ctx) {
            ctx.content(bh.xmlEscape(ctx.content()), true);
        });

        bh.apply({
            block: 'suggest-item',
            content: "<"
        }).should.equal('<div class="suggest-item">&lt;</div>');
    });

    it('should match and make unescape xml string: &gt', function() {
        bh.match('suggest-item', function(ctx) {
            ctx.content(bh.xmlEscape(ctx.content()), true);
        });

        bh.apply({
            block: 'suggest-item',
            content: ">"
        }).should.equal('<div class="suggest-item">&gt;</div>');
    });

    it('should match and make unescape xml string: (&amp, &lt, &gt)', function() {
        bh.match('suggest-item', function(ctx) {
            ctx.content(bh.xmlEscape(ctx.content()), true);
        });

        var xml = '<?xml version="1&0" ?>';
        bh.apply({
            block: 'suggest-item',
            content: xml
        }).should.equal('<div class="suggest-item">&lt;?xml version="1&amp;0" ?&gt;</div>');
    });
});

describe('bh.attrEscape()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should match and make unescape atrr string: &amp', function() {
        bh.match('suggest', function(ctx) {
            ctx.content(bh.attrEscape(ctx.content()), true);
        });

        bh.apply({
            block: 'suggest',
            content: 'a&b'
        }).should.equal('<div class="suggest">a&amp;b</div>');
    });

    it('should match and make unescape atrr string: &quot', function() {
        bh.match('suggest', function(ctx) {
            ctx.content(bh.attrEscape(ctx.content()), true);
        });

        bh.apply({
            block: 'suggest',
            content: 'a"b'
        }).should.equal('<div class="suggest">a&quot;b</div>');
    });

    it('should match and make unescape atrr string: &lt', function() {
        bh.match('suggest', function(ctx) {
            ctx.content(bh.attrEscape(ctx.content()), true);
        });

        bh.apply({
            block: 'suggest',
            content: 'a<b'
        }).should.equal('<div class="suggest">a&lt;b</div>');
    });

    it('should match and make unescape atrr string: &gt', function() {
        bh.match('suggest', function(ctx) {
            ctx.content(bh.attrEscape(ctx.content()), true);
        });

        bh.apply({
            block: 'suggest',
            content: 'a>b'
        }).should.equal('<div class="suggest">a&gt;b</div>');
    });


    it('should match and make unescape atrr string: (&quot, &amp, &lt, &gt)', function() {
        bh.match('suggest', function(ctx) {
            ctx.content(bh.attrEscape(ctx.content()), true);
        });

        var xml = '<?xml version="1&0" ?>';
        bh.apply({
            block: 'suggest',
            content: xml
        }).should.equal('<div class="suggest">&lt;?xml version=&quot;1&amp;0&quot; ?&gt;</div>');
    });
});
