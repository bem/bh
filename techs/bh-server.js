var fs = require('fs');

module.exports = require('enb/lib/build-flow').create()
    .name('bh-server')
    .target('target', '?.bemhtml.js')
    .defineOption('bhFile', '')
    .useFileList(['bh.js'])
    .needRebuild(function(cache) {
        this._bhFile = this._bhFile || 'node_modules/bh/lib/bh.js';
        this._bhFile = this.node._root + '/' + this._bhFile;
        return cache.needRebuildFile('bh-file', this._bhFile);
    })
    .saveCache(function(cache) {
        cache.cacheFileInfo('bh-file', this._bhFile);
    })
    .builder(function(bhFiles) {
        var node = this.node;
        function buildRequire(absPath, pre, post) {
            var relPath = node.relativePath(absPath);
            return [
                'delete require.cache[require.resolve("' + relPath + '")];',
                (pre || '') + 'require("' + relPath + '")' + (post || '') + ';'
            ].join('\n');
        }
        return [
            buildRequire(this._bhFile, 'var BH = '),
            'var bh = new BH();',
            bhFiles.map(function(file) {
                return buildRequire(file.fullname, '', '(bh)');
            }).join('\n'),
            'module.exports = bh;'
        ].join('\n');
    })
    .createTech();
