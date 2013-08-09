var BH = require('../lib/bh');
require('chai').should();

describe('ctx.applyBase()', function() {
    var bh;
    beforeEach(function() {
        bh = new BH();
    });
    it('should apply templates new mod', function() {
        bh.match('button', function(ctx) {
            ctx.mod('type', 'span');
            ctx.applyTemplates();
        });
        bh.match('button_type_span', function(ctx) {
            ctx.tag('span');
        });
        bh.apply({ block: 'button' }).should.equal(
            '<span class="button button_type_span"></span>'
        );
    });
});
