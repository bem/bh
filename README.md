BH
==

BH — это BEMJSON-процессор. Его главная цель — превратить BEMJSON в HTML.

Зачем нужен BH, если есть BEMHTML?
----------------------------------

1. BH быстрый. Очень быстрый.
2. BH не требует компиляции (в отличие от BEMHTML).
3. BH удобен в отладке, т.к. он не компилируется в другой код (в отличие от BEMHTML).
4. BH написан на чистом JavaScript, используется и расширяется через JavaScript.
5. BH прост для понимания, ведь это всего лишь обертка над обычными преобразованиями исходного BEMJSON в конечный BEMJSON.
6. BH компактен на клиенте.

Метрики
-------

Скорость обработки BEMJSON на примере беты Яндекс.Карт (1000 итераций).
```javascript
BH - 1079ms (927 times per second)
bemhtml - 2989ms (335 times per second)
BEM.HTML - 1422ms (703 times per second)
```

Вес результирующего файла (сжатого):
```javascript
BH - 40kb.
BEMHTML - 76kb.
```

Время сборки.
```javascript
BH - 50-60ms.
BEMHTML (dev) - 2000-3000ms.
BEMHTML (prod) - 6000-7000ms.
```

Установка
---------

BH-процессор и ENB-технологии для его использования можно найти в npm-пакете `bh`.

```
npm install bh
```

Использование
-------------

BH-файлы в проекте имеют суффикс `bh.js`. Например, `b-page.bh.js`. Файл формируется в формате CommonJS для NodeJS:

```javascript
module.exports = function(bh) {
    // ...
};
```

Преобразования
--------------

Функции для работы (**матчеры**) с BEMJSON объявляются через метод `match`. В теле функций описывается логика преобразования BEMJSON.

Например, зададим блоку `button` тег `button`, а блоку `input` тег `input`:

```javascript
module.exports = function(bh) {
    bh.match('button', function(ctx) {
        ctx.tag = ctx.tag || 'button';
    });
    bh.match('input', function(ctx) {
        ctx.tag = ctx.tag || 'input';
    });
};
```

Обратите внимание на конструкцию `ctx.tag = ctx.tag || 'button';`. Она написана для того, чтобы не трогать тег в случае, когда он задан явно (в исходном BEMJSON или на другом уровне переопределения).

Теперь нам нужна псевдо-кнопка. То есть, если у кнопки модификатор `pseudo` равен `yes`, то нужен тег `a` и атрибут `role="button"`:

```javascript
module.exports = function(bh) {
    bh.match('button_pseudo_yes', function(ctx) {
        ctx.tag = ctx.tag || 'a';
        ctx.attrs.role = ctx.attrs.role || 'button';
    });
};
```

В данном примере мы матчимся не просто на блок `button`, а на блок `button` с модификатором `pseudo`, имеющим значение `yes`.

Матчинг
-------

Рассмотрим синтаксис строки матчинга для функций преобразования:

```javascript
'block[_blockModName_blockModVal][__elemName][_elemModName_elemModVal]'
```

По-русски:

```javascript
'блок[_имяМодификатораБлока_значениеМодификатораБлока][__имяЭлемента][_имяМодификатораЭлемента_значениеМодификатораЭлемента]'
```

(В квадратных скобках необязательные параметры)

Еще примеры
-----------

Например, мы хотим установить модификатор `state` со значением `closed` для всех блоков `popup`:

```javascript
bh.match('popup', function(ctx) {
    ctx.mods.state = ctx.mods.state || 'closed';
});
```

Замиксуем `form` в `search-form`:

```javascript
bh.match('search-form', function(ctx) {
    ctx.mix.push({ block: 'form' });
});
```

Установим класс для `b-page`:

```javascript
bh.match('b-page', function(ctx) {
    ctx.cls = ctx.cls || 'i-ua_js_no i-ua_css_standard';
});
```

Преобразование BEMJSON-дерева
-----------------------------

Кроме модификации элемента, функция-преобразователь может вернуть новый BEMJSON.

Например, обернем блок `header` блоком `header-wrapper`:

```javascript
bh.match('header', function(ctx) {
    return {
        block: 'header-wrapper',
        content: ctx
    };
});
```

Обернем содержимое `button` элементом `content`:

```javascript
bh.match('button', function(ctx) {
    ctx.content = {
        elem: 'content',
        content: ctx.content
    };
});
```
