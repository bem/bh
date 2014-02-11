var BH = require('../lib/bh');
require('chai').should();

describe('dirtyEnv', function() {
    var bh;
    beforeEach(function() {
        Object.prototype.type = 'invisible';
        bh = new BH();
    });
    afterEach(function() {
        delete Object.prototype.type;
    });
    describe('ctx.extend()', function() {
        it('should not extend with prototype field', function() {
            bh.match('button', function(ctx) {
                ctx.extend({}, {}).hasOwnProperty('type').should.equal(false);
            });
            bh.apply({ block: 'button' });
        });
    });
    describe('ctx.attr()', function() {
        it('should return empty attr', function() {
            bh.match('button', function(ctx) {
                ctx.attr('border', 0); // json.attrs must be instance of Object
                (ctx.attr('type') === undefined).should.equal(true);
            });
            bh.apply({ block: 'button' });
        });
        it('should set attr', function() {
            bh.match('button', function(ctx) {
                ctx.attr('type', 'button');
            });
            bh.apply({ block: 'button' }).should.equal('<div class="button" type="button"></div>');
        });
    });
    describe('ctx.mod()', function() {
        it('should return empty mod', function() {
            bh.match('button', function(ctx) {
                ctx.mod('theme', 'light'); // json.mods must be instance of Object
                (ctx.mod('type') === undefined).should.equal(true);
            });
            bh.apply({ block: 'button' });
        });
        it('should set mod', function() {
            bh.match('button', function(ctx) {
                ctx.mod('type', 'button');
            });
            bh.apply({ block: 'button' }).should.equal('<div class="button button_type_button"></div>');
        });
    });
    describe('ctx.mods()', function() {
        it('should not return inherited values', function() {
            bh.match('button', function(ctx) {
                ctx.mods({ theme: 'light' });
                ctx.mods().hasOwnProperty('type').should.equal(false);
            });
            bh.apply({ block: 'button' });
        });
        it('should set mods', function() {
            bh.match('button', function(ctx) {
                ctx.mods({ type: 'button' });
            });
            bh.apply({ block: 'button' }).should.equal('<div class="button button_type_button"></div>');
        });
    });
    // TODO:
    // bem(),
    // cls(),
    // content(),
    // js(),
    // mix(),
    // param(),
    // tag()
});
