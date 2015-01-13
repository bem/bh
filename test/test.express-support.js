var bh = require('..');
var fs = require('fs');
var path = require('path');

require('chai').should();

describe('bh.__express', function() {
    var engine = bh.__express;

    it('should work with passed bemjson', function(done) {
        var htmlPath = path.join(__dirname, 'fixtures/express-support/example.html');
        var bhPath = path.join(__dirname, 'fixtures/express-support/example.bh');
        var expected = fs.readFileSync(htmlPath, 'utf8').replace(/\s/g, '');

        engine(bhPath, { bemjson: { block: 'root' }, name: 'foo' }, function(err, html) {
            var actual = html.replace(/\s/g, '');

            if (err) {
                return done(err);
            }

            actual.should.equal(expected);

            done();
        });
    });

    it('should work without passed bemjson', function(done) {
        var htmlPath = path.join(__dirname, 'fixtures/express-support/example.html');
        var bhPath = path.join(__dirname, 'fixtures/express-support/example.bh');
        var expected = fs.readFileSync(htmlPath, 'utf8').replace(/\s/g, '');

        engine(bhPath, { name: 'foo' }, function(err, html) {
            var actual = html.replace(/\s/g, '');

            if (err) {
                return done(err);
            }

            actual.should.equal(expected);

            done();
        });
    });

    it('should work without data argument', function(done) {
        var htmlPath = path.join(__dirname, 'fixtures/express-support/example.html');
        var bhPath = path.join(__dirname, 'fixtures/express-support/without-data.bh');
        var expected = fs.readFileSync(htmlPath, 'utf8').replace(/\s/g, '');

        engine(bhPath, function(err, html) {
            var actual = html.replace(/\s/g, '');

            if (err) {
                return done(err);
            }

            actual.should.equal(expected);

            done();
        });
    });

    it('should return an error if it happens', function(done) {
        var bhPath = path.join(__dirname, 'fixtures/express-support/error.bh');

        engine(bhPath, { name: 'foo' }, function(err) {
            err.should.be.ok();

            done();
        });
    });
});
