var BH = require('../lib/bh');
require('chai').should();

describe('bh.buildMatcher()', function() {
    it('should build a dispatcher for registered matchers', function() {
        var bh = new BH();
        var matcher = function(ctx, json) {
            json.tag = 'button';
        };
        bh.match('button_disabled', matcher);

        var createMatcher = Function('ms', bh.buildMatcher());
        var applyMatchers = createMatcher([['button_disabled', matcher]]);
        var json = { block: 'button', mods: { disabled: true } };
        var ctx = { ctx: json };

        applyMatchers(ctx, json);

        json.tag.should.equal('button');
    });
});
