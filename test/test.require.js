var BH = require('../lib/bh');
require('chai').should();

describe('bh.require()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should have lib namespace', function() {
        bh.lib.should.eql({});
    });

    it('should require depend by name', function() {
        bh.lib.depend = 'value';

        bh.require('depend').should.equal('value');
    });

    it('should export undefined if depend is not found', function() {
        var depend = bh.require('depend');

        (typeof depend).should.equal('undefined');
    });
});
