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
});
