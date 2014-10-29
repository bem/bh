var BH = require('../lib/bh');
require('chai').should();

describe('ctx.generateId()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });
    it('should generate different ids', function() {
        bh.match('button', function(ctx) {
            ctx.generateId().should.not.equal(ctx.generateId());
        });
        bh.apply({ block: 'button' });
    });

    it('should generate different ids within few calls of apply', function() {
        var id1, id2;

        bh.match('button1', function(ctx) {
            id1 = ctx.generateId();
        });
        bh.apply({ block: 'button1' });

        bh.match('button2', function(ctx) {
            id2 = ctx.generateId();
        });
        bh.apply({ block: 'button2' });

        id1.should.not.equal(id2);
    });
});
