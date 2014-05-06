var BH = require('../lib/bh');
require('chai').should();

describe('ctx.isSimple()', function() {
    var bh = new BH();
    it('should return true for undefined', function() {
        bh.utils.isSimple().should.equal(true);
    });
    it('should return true for null', function() {
        bh.utils.isSimple(null).should.equal(true);
    });
    it('should return true for number', function() {
        bh.utils.isSimple(1).should.equal(true);
    });
    it('should return true for string', function() {
        bh.utils.isSimple('1').should.equal(true);
    });
    it('should return true for boolean', function() {
        bh.utils.isSimple(false).should.equal(true);
    });
    it('should return false for array', function() {
        bh.utils.isSimple([]).should.equal(false);
    });
    it('should return false for object', function() {
        bh.utils.isSimple({}).should.equal(false);
    });
});
