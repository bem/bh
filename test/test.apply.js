var BH = require('../lib/bh');
require('chai').should();

describe('bh.apply()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });

    it('should return empty string on undefined bemjson', function() {
        bh.apply().should.equal('');
    });

    it('should return empty string on falsy template result', function() {
        bh.match('link', function(ctx, json) {
            if (!json.url) return null;
        });
        bh.apply({ block: 'link' }).should.equal('');
    });
});
