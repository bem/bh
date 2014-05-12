var BH = require('../lib/bh');
require('chai').should();

describe('options', function() {
    describe('extend', function() {
        var bh;
        beforeEach(function() {
            bh = new BH();
        });
        it('should extend empty target', function() {
            bh.match('button', function(ctx) {
                ctx.extend(null, { foo: 'bar' })
                    .foo.should.equal('bar');
            });
            bh.apply({ block: 'button' });
        });
        it('should extend object', function() {
            bh.match('button', function(ctx) {
                ctx.extend(
                    { foo: 'bar' },
                    { foo: 'foo' }
                ).foo.should.equal('foo');
            });
            bh.apply({ block: 'button' });
        });
    });
});
