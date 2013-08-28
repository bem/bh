/**
 * bh-server
 * =========
 *
 * Склеивает *bh*-файлы по deps'ам с помощью набора `require` в виде `?.bemhtml.js`.
 *
 * **Опции**
 *
 * * *String* **target** — Результирующий таргет. По умолчанию — `?.bemhtml.js`.
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
 * nodeConfig.addTech(require('bh/techs/bh-server'));
 * ```
 */
module.exports = require('enb/lib/build-flow').create()
    .name('bh-server')
    .target('target', '?.bemhtml.js')
    .defineOption('bhFile', '')
    .defineOption('jsAttrName', 'onclick')
    .defineOption('jsAttrScheme', 'js')
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
        /**
         * Генерирует `require`-строку для подключения исходных bh-файлов.
         *
         * @param {String} absPath
         * @param {String} pre
         * @param {String} post
         */
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
            'bh.setOptions({',
                'jsAttrName: \'' + this._jsAttrName + '\',',
                'jsAttrScheme: \'' + this._jsAttrSheme + '\'',
            '})',
            bhFiles.map(function(file) {
                return buildRequire(file.fullname, '', '(bh)');
            }).join('\n'),
            'module.exports = bh;',
            'bh.BEMHTML = { apply: function(bemjson) { return bh.apply(bemjson); } };'
        ].join('\n');
    })
    .createTech();
