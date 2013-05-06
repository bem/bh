var fs = require('fs'),
    Vow = require('vow'),
    vowFs = require('vow-fs'),
    bhClientProcessor = require('../lib/bh-client-processor');

module.exports = require('enb/lib/build-flow').create()
    .name('bh-client')
    .target('target', '?.bemhtml.client.js')
    .defineOption('bhFile', '')
    .defineOption('dependencies', {})
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
        var dependencies = this._dependencies;
        return Vow.all([
            vowFs.read(this._bhFile, 'utf8').then(function(data) {
                return bhClientProcessor.processBHEngineSource(data);
            }),
            Vow.all(bhFiles.map(function(file) {
                return vowFs.read(file.fullname, 'utf8').then(function(data) {
                    var relPath = node.relativePath(file.fullname);
                    return '// begin: ' + relPath + '\n'
                        + bhClientProcessor.process(data) + '\n'
                        + '// end: ' + relPath + '\n';
                });
            })).then(function(sr) {
                return sr.join('\n');
            })
        ]).spread(function(bhEngineSource, inputSources) {
            return bhClientProcessor.buildModule(bhEngineSource, inputSources, dependencies);
        });
    })
    .createTech();
