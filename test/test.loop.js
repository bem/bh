var BH = require('../lib/bh');
require('chai').should();

describe('loop', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
        bh.enableInfiniteLoopDetection(true);
    });
    it('should reject recursively nested references to the same BEMJSON node', function(done) {
        var button = { block: 'button' };
        bh.match('button', function(ctx) {
            ctx.content(button);
        });
        try {
            bh.apply(button);
            done(new Error('no error was thrown'));
        } catch (e) {
            done();
        }
    });
    it('should reject an endless chain of newly created matcher nodes', function(done) {
        bh.match('input', function(ctx) {
            ctx.content({ block: 'button' });
        });
        bh.match('button', function(ctx) {
            ctx.content({ block: 'input' });
        });
        try {
            bh.apply({ block: 'button' });
            done(new Error('no error was thrown'));
        } catch (e) {
            done();
        }
    });
});
