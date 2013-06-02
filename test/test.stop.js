var BH = require('../lib/bh');
require('chai').should();

describe('ctx.stop()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });
    it('should prevent base matching', function() {
        bh.match('button', function(ctx) {
            ctx.tag('button', true);
        });
        bh.match('button', function(ctx) {
            ctx.tag('span');
            ctx.stop();
        });
        bh.apply({ block: 'button' }).should.equal(
            '<span class="button"></span>'
        );
    });
});
