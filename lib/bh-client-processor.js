module.exports = {
    /**
     * Adapts single BH file content to client-side.
     * @param {String} input
     * @returns {String}
     */
    process: function (input) {
        return input
            .replace(/module\.exports\s*=\s*function\s*\([^\)]*\)\s*{/, '')
            .replace(/}\s*(?:;)?\s*$/, '');
    },

    /**
     * Builds module (see npm package "ym").
     * @param {String} bhEngineSource
     * @param {String} inputSources
     * @param {Object} dependencies example: {libName: "dependencyName"}
     * @param {String} jsAttrName
     * @param {String} jsAttrScheme
     * @returns {string}
     */
    buildModule: function (bhEngineSource, inputSources, dependencies, jsAttrName, jsAttrScheme) {
        var libNames;
        var depNames;
        var libPrepares;
        if (dependencies) {
            libNames = Object.keys(dependencies);
            libPrepares = libNames.map(function (libName) {
                return 'bh.lib.' + libName + ' = ' + libName + ';';
            });
            depNames = libNames.map(function (libName) {
                return dependencies[libName];
            });
        }
        return 'modules.define(\'bh\'' +
            (depNames ? ', ' + JSON.stringify(depNames) : '') +
            ', function(provide' + (libNames && libNames.length ? ', ' + libNames.join(', ') : '') + ') {\n' +
            bhEngineSource + '\n' +
            'var bh = new BH();\n' +
            'bh.setOptions({\n' +
            '    jsAttrName: \'' + jsAttrName + '\',\n' +
            '    jsAttrScheme: \'' + jsAttrScheme + '\'\n' +
            '});\n' +
            (libPrepares ? libPrepares.join('\n') + '\n' : '') +
            inputSources + '\n' +
            'provide(bh);\n' +
            '});\n';
    },

    /**
     * Builds client js.
     * @param {String} bhEngineSource
     * @param {String} inputSources
     * @param {Object} dependencies example: {libName: "dependencyName"}
     * @param {String} jsAttrName
     * @param {String} jsAttrScheme
     * @returns {string}
     */
    build: function (bhEngineSource, inputSources, dependencies, jsAttrName, jsAttrScheme) {
        var libNames;
        var libPrepares;
        if (dependencies) {
            libNames = Object.keys(dependencies);
            libPrepares = libNames.map(function (libName) {
                return 'bh.lib.' + libName + ' = ' + dependencies[libName] + ';';
            });
        }
        return bhEngineSource + '\n' +
            'var bh = new BH();\n' +
            'bh.setOptions({\n' +
            '    jsAttrName: \'' + jsAttrName + '\',\n' +
            '    jsAttrScheme: \'' + jsAttrScheme + '\'\n' +
            '});\n' +
            (libPrepares ? libPrepares.join('\n') + '\n' : '') +
            inputSources +
            '/** BEMHTML mimic */' +
            'var BEMHTML = bh;';
    },

    buildBEMHTMLMimic: function () {
        return 'modules.define(\'BEMHTML\', [\'bh\'], function(provide, bh) { provide(bh); });\n';
    }
};
