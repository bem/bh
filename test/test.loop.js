var BH = require('../lib/bh');
require('chai').should();

describe('loop', function() {
    describe('jsAttr', function() {
        var bh;
        beforeEach(function() {
            bh = new BH();
            bh.enableInfiniteLoopDetection(true);
        });
        it('should throw an error on json loop detection', function(done) {
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
        it('should throw an error on matcher loop detection', function(done) {
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
});
