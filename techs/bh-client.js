/**
 * bh-client
 * =========
 * 
 * Склеивает *bh*-файлы по deps'ам с помощью набора `require` в виде `?.bemhtml.client.js`.
 * Предназначен для сборки клиентского BH-кода.
 * 
 * **Опции**
 * 
 * * *String* **target** — Результирующий таргет. По умолчанию — `?.bemhtml.client.js`.
 * * *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов (его предоставляет технология `files`). По умолчанию — `?.files`.
 * 
 * **Пример**
 * 
 * ```javascript
 * nodeConfig.addTech(require('bh/techs/bh-client'));
 * ```
 */
 var Vow = require('vow'),
    vowFs = require('vow-fs'),
    bhClientProcessor = require('../lib/bh-client-processor');

module.exports = require('enb/lib/build-flow').create()
    .name('bh-client')
    .target('target', '?.bemhtml.client.js')
    .defineOption('bhFile', '')
    .defineOption('dependencies', {})
    .useFileList(['bh.js'])
    /**
     * Отдельно кэшируем BH-библиотеку.
     */
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
                return data;
            }),
            Vow.all(bhFiles.map(function(file) {
                return vowFs.read(file.fullname, 'utf8').then(function(data) {
                    var relPath = node.relativePath(file.fullname);
                    /**
                     * Выставляем комментарии о склеенных файлах.
                     */
                    return '// begin: ' + relPath + '\n' +
                        bhClientProcessor.process(data) + '\n' +
                        '// end: ' + relPath + '\n';
                });
            })).then(function(sr) {
                return sr.join('\n');
            })
        ]).spread(function(bhEngineSource, inputSources) {
            return bhClientProcessor.build(bhEngineSource, inputSources, dependencies);
        });
    })
    .createTech();
