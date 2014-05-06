/**
 * bh-client-module
 * ================
 *
 * Склеивает *bh*-файлы по deps'ам с помощью набора `require` в виде `?.bemhtml.client.js`.
 * Предназначен для сборки клиентского BH-кода.
 * Использует модульную обертку.
 *
 * **Опции**
 *
 * * *String* **target** — Результирующий таргет. По умолчанию — `?.bemhtml.client.js`.
 * * *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов (его предоставляет технология `files`). По умолчанию — `?.files`.
 * * *String* **jsAttrName** — атрибут блока с параметрами инициализации. По умолчанию — `onclick`.
 * * *String* **jsAttrScheme** — Cхема данных для параметров инициализации. По умолчанию — `js`.
 * *                             Форматы:
 * *                                `js` — значение по умолчанию. Получаем `return { ... }`.
 * *                                `json` — JSON-формат. Получаем `{ ... }`.
 *
 * **Пример**
 *
 * ```javascript
 * nodeConfig.addTech(require('bh/techs/bh-client-module'));
 * ```
 */

console.log('WARNING! `bh/techs` was deprecated! Use `enb-bh` package instead!');

 var Vow = require('vow'),
    vowFs = require('vow-fs'),
    bhClientProcessor = require('../lib/bh-client-processor');

module.exports = require('enb/lib/build-flow').create()
    .name('bh-client-module')
    .target('target', '?.bemhtml.client.js')
    .defineOption('bhFile', '')
    .defineOption('dependencies', {})
    .defineOption('jsAttrName', 'onclick')
    .defineOption('jsAttrScheme', 'js')
    .useFileList(['bh.js'])
    .needRebuild(function(cache) {
        console.log('WARNING! `bh/techs` was deprecated! Use `enb-bh` package instead!');
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
        var jsAttrName = this._jsAttrName;
        var jsAttrScheme = this._jsAttrScheme;
        return Vow.all([
            vowFs.read(this._bhFile, 'utf8').then(function(data) {
                return data;
            }),
            Vow.all(bhFiles.map(function(file) {
                return vowFs.read(file.fullname, 'utf8').then(function(data) {
                    var relPath = node.relativePath(file.fullname);
                    return '// begin: ' + relPath + '\n' +
                        bhClientProcessor.process(data) + '\n' +
                        '// end: ' + relPath + '\n';
                });
            })).then(function(sr) {
                return sr.join('\n');
            })
        ]).spread(function(bhEngineSource, inputSources) {
            return bhClientProcessor.buildModule(bhEngineSource, inputSources, dependencies, jsAttrName, jsAttrScheme);
        });
    })
    .createTech();
