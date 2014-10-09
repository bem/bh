var BH = require('../lib/bh');
require('chai').should();

describe('ctx.html()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should return bemjson html', function() {
        bh.match('button', function(ctx) {
            ctx.html().should.equal('Hello');
        });
        bh.apply({ block: 'button', html: 'Hello' });
    });

    it('should set bemjson html', function() {
        bh.match('icon', function(ctx) {
            ctx.html('<i>&nbsp;</i>');
        });
        bh.apply({ block: 'icon' }).should.equal('<div class="icon"><i>&nbsp;</i></div>');
    });

    it('should not override user html', function() {
        bh.match('icon', function(ctx) {
            ctx.html('<i>&nbsp;</i>');
        });
        bh.apply({ block: 'icon', html: '&nbsp;' }).should.equal('<div class="icon">&nbsp;</div>');
    });

    it('should not override later declarations', function() {
        bh.match('icon', function(ctx) {
            ctx.html('text2');
        });
        bh.match('icon', function(ctx) {
            ctx.html('text1');
        });
        bh.apply({ block: 'icon' }).should.equal('<div class="icon">text1</div>');
    });

    it('should override later declarations with force flag', function() {
        bh.match('icon', function(ctx) {
            ctx.html('text2', true);
        });
        bh.match('icon', function(ctx) {
            ctx.html('text1');
        });
        bh.apply({ block: 'icon' }).should.equal('<div class="icon">text2</div>');
    });

    it('should override user declarations with force flag', function() {
        bh.match('icon', function(ctx) {
            ctx.html('text', true);
        });
        bh.apply({ block: 'icon', html: 'Hello' }).should.equal('<div class="icon">text</div>');
    });
});
