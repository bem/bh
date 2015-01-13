/**
 * Produces html from bh-templates and optional data
 * and invokes passed callback with result
 *
 * @param  {String}     filePath   path to bh-template
 * @param  {Object}     [options]  data to use in templates
 * @param  {Function}   cb         callback to invoke with result or error
 * @return {Undefined}             undefined value
 */
module.exports = function(filePath, options, cb) {
    var bh;
    var html;

    // support two arguments, because `options` are optional
    if (typeof options === 'function') {
        cb = options;
        options = {};
    }

    // define default bemjson
    if (!options.bemjson) {
        options.bemjson = { block: 'root' };
    }

    try {
        bh = require(filePath);

        // add data to use in templates
        options.bemjson.data = bh.utils.extend({}, options);
        delete options.bemjson.data.bemjson;

        html = bh.apply(options.bemjson);
    } catch (err) {
        cb(err);
        return;
    }

    cb(null, html);
};
