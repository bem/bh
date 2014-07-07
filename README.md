BH [![NPM version](https://badge.fury.io/js/bh.svg)](http://badge.fury.io/js/bh) [![Build Status](https://travis-ci.org/enb-make/bh.svg?branch=master)](https://travis-ci.org/enb-make/bh) [![Dependency Status](https://gemnasium.com/enb-make/bh.svg)](https://gemnasium.com/enb-make/bh) [![Coverage Status](https://img.shields.io/coveralls/enb-make/bh.svg?branch=master)](https://coveralls.io/r/enb-make/bh)
===

BH — это BEMJSON-процессор, его главная цель — превратить BEMJSON в HTML.

Чем же так хорош BH?
--------------------

1. Он быстрый.
2. Не требует компиляции.
3. Удобен в отладке, т.к. он не компилируется в другой код.
4. Написан на чистом JavaScript, используется и расширяется через JavaScript.
5. Прост для понимания, ведь это всего лишь обертка над обычными преобразованиями исходного BEMJSON в конечный BEMJSON / HTML.
6. Компактен на клиенте (12,5 Кб после сжатия, 3,5 Кб после gzip).

Установка
---------

BH-процессор можно найти в npm-пакете `bh`, а ENB-технологии для его использования — в npm-пакете `enb-bh`.

```
npm install bh
```

Использование
-------------

BH-файлы в проекте имеют суффикс `bh.js` (например, `page.bh.js`). Файл формируется в формате CommonJS для NodeJS:

```javascript
module.exports = function(bh) {
    // ...
};
```

Преобразования
--------------

Функции для работы с BEMJSON — **шаблоны** — объявляются через метод `match`. В теле функций описывается логика преобразования BEMJSON.

Синтаксис:

```javascript
{BH} bh.match({String} expression, function({Ctx} ctx) {
    //.. actions
});
```

Также допустимо объявлять несколько шаблонов в одном вызове метода `match`.

Синтаксис:

```javascript
{BH} bh.match({Array} expressions, function({Ctx} ctx));

```

Где `expressions` — массив вида:

```javascript
[
    {String} expression1,
    ...,

    {String} expressionN
]
```

Или в виде объекта:

```javascript
{BH} bh.match({Object} templates);

```

Где `templates` представляет собой объект вида:

```javascript
{
    {String} expression1 : function({Ctx} ctx) {
        //.. actions1
    },

    ...,

    {String} expressionN : function({Ctx} ctx) {
        //.. actionsN
    },
}
```

Ниже в этом документе можно найти перечень методов класса Ctx. Дальше пойдем по примерам.

Например, зададим блоку `button` тег `button`, а блоку `input` тег `input`:

```javascript
bh.match('button', function(ctx) {
    ctx.tag('button');
});
bh.match('input', function(ctx) {
    ctx.tag('input');
});
```

Теперь нам нужна псевдо-кнопка. То есть, если у кнопки модификатор `pseudo` равен `yes`, то нужен тег `a` и атрибут `role="button"`:

```javascript
bh.match('button_pseudo_yes', function(ctx) {
    ctx
        .tag('a')
        .attr('role', 'button');
});
```

В данном примере мы матчимся не просто на блок `button`, а на блок `button` с модификатором `pseudo`, имеющим значение `yes`.

Матчинг
-------

Рассмотрим синтаксис строки матчинга для функций преобразования (в квадратных скобках необязательные параметры):

```javascript
'block[_blockModName[_blockModVal]][__elemName][_elemModName[_elemModVal]]'
```

По-русски:

```javascript
'блок[_имяМодификатораБлока[_значениеМодификатораБлока]][__имяЭлемента][_имяМодификатораЭлемента[_значениеМодификатораЭлемента]]'
```

Еще примеры
-----------

Например, мы хотим установить модификатор `state` со значением `closed` для всех блоков `popup`:

```javascript
bh.match('popup', function(ctx) {
    ctx.mod('state', 'closed');
});
```

Замиксуем `form` в `search-form`:

```javascript
bh.match('search-form', function(ctx) {
    ctx.mix({ block: 'form' });
});
```

Установим класс для `page`:

```javascript
bh.match('page', function(ctx) {
    ctx.cls('ua_js_no ua_css_standard');
});
```

Преобразование BEMJSON-дерева
-----------------------------

Кроме модификации элемента, функция-преобразователь может вернуть новый BEMJSON. Здесь мы воспользуемся методами `ctx.json()` (возвращает текущий элемент BEMJSON "как есть") и `ctx.content()` (возвращает или устанавливает контент).

Например, обернем блок `header` блоком `header-wrapper`:

```javascript
bh.match('header', function(ctx) {
    return {
        block: 'header-wrapper',
        content: ctx.json()
    };
});
```

Обернем содержимое `button` элементом `content`:

```javascript
bh.match('button', function(ctx) {
    ctx.content({
        elem: 'content',
        content: ctx.content()
    }, true);
});
```

Метод `ctx.content` принимает первым аргументом BEMJSON, который надо выставить для содержимого, а вторым — флаг force (выставить содержимое даже если оно уже существует).

Добавим элемент `before` в начало, а `after` в конец содержимого блока `header`:

```javascript
bh.match('header', function(ctx) {
    ctx.content([
        { elem: 'before' },
        ctx.content(),
        { elem: 'after' }
    ], true);
});
```

Добавим блок `before-button` перед блоком `button`:

```javascript
bh.match('button', function(ctx) {
    return [
        { block: 'before-button' },
        ctx.json()
    ];
});
```


Класс Ctx
=========

Инстанции класса `Ctx` передаются во все шаблоны. Все методы класса в set-режиме возвращают инстанцию класса, то есть реализут чейнинг.
Рассмотрим методы класса:

ctx.tag([value[, force]])
------------------------

Возвращает/устанавливает тег в зависимости от аргументов. **force** — задать значение тега даже если оно было задано ранее.

```javascript
bh.match('input', function(ctx) {
    ctx.tag('input');
});
```

ctx.mod(key[, value[, force]])
------------------------

Возвращает/устанавливает модификатор в зависимости от аргументов. **force** — задать модификатор даже если он был задан ранее.

```javascript
bh.match('input', function(ctx) {
    ctx.mod('native', 'yes');
    ctx.mod('disabled', true);
});

bh.match('input_islands_yes', function(ctx) {
    ctx.mod('native', '', true);
    ctx.mod('disabled', false, true);
});
```

ctx.mods([values[, force]])
---------------------------

Возвращает/устанавливает модификаторы в зависимости от аргументов. **force** — задать модификаторы даже если они были заданы ранее.

```javascript
bh.match('paranja', function(ctx) {
    ctx.mods({
        theme: 'normal',
        disabled: true
    });
});
```

ctx.attr(key[, value[, force]])
------------------------

Возвращает/устанавливает значение атрибута в зависимости от аргументов. **force** — задать значение атрибута даже если оно было задано ранее.

```javascript
bh.match('input_disabled_yes', function(ctx) {
    ctx.attr('disabled', 'disabled');
});
```

*Замечание*: Если необходимо удалить сам атрибут, а не просто обнулить значение атрибута, то вторым параметром надо передать `null`:

```javascript
bh.match('link', function(ctx) {
    ctx.attr('href', null);
});
```

ctx.attrs([values[, force]])
---------------------------

Возвращает/устанавливает атрибуты в зависимости от аргументов. **force** — задать атрибуты даже если они были заданы ранее.

```javascript
bh.match('input', function(ctx) {
    ctx.attrs({
        name: ctx.param('name'),
        autocomplete: 'off'
    });
});
```

ctx.mix([value[, force]])
------------------------

Возвращает/устанавливает значение mix в зависимости от аргументов.
При установке значения, если **force** равен **true**, то переданный микс заменяет прежнее значение, в противном случае миксы складываются.

```javascript
bh.match('button_pseudo_yes', function(ctx) {
    ctx.mix({ block: 'link', mods: { pseudo: 'yes' } });
    ctx.mix([
        { elem: 'text' },
        { block: 'ajax' }
    ]);
});
```

ctx.bem([value[, force]])
------------------------

Возвращает/устанавливает значение bem в зависимости от аргументов. **force** — задать значение bem даже если оно было задано ранее.
Если bem имеет значение **false**, то для элемента не будут генерироваться BEM-классы.

```javascript
bh.match('meta', function(ctx) {
    ctx.bem(false);
});
```

ctx.js([value[, force]])
------------------------

Возвращает/устанавливает значение js в зависимости от аргументов. **force** — задать значение js даже если оно было задано ранее.
Значение js используется для инициализации блоков в браузере через `BEM.DOM.init()`.

```javascript
bh.match('input', function(ctx) {
    ctx.js(true);
});
```

ctx.content([value[, force]])
-----------------------------

Возвращает/устанавливает содержимое в зависимости от аргументов. **force** — задать содержимое даже если оно было задано ранее.

```javascript
bh.match('input', function(ctx) {
    ctx.content({ elem: 'control' });
});
```

ctx.json()
----------

Возвращает текущий фрагмент BEMJSON-дерева. Может использоваться в связке с `return` для враппинга и подобных целей.

```javascript
bh.match('input', function(ctx) {
    return {
        elem: 'wrapper',
        content: ctx.json()
    };
});
```

ctx.position()
--------------
ctx.isFirst()
-------------
ctx.isLast()
------------

**ctx.position()** возвращает позицию текущего BEMJSON-элемента в рамках родительского.
**ctx.isFirst()** возвращает true, если текущий BEMJSON-элемент первый в рамках родительского BEMJSON-элемента.
**ctx.isLast()** возвращает true, если текущий BEMJSON-элемент последний в рамках родительского BEMJSON-элемента.

Пример:
```javascript
bh.match('list__item', function(ctx) {
    ctx.mod('pos', ctx.position());
    if (ctx.isFirst()) {
        ctx.mod('first', 'yes');
    }
    if (ctx.isLast()) {
        ctx.mod('last', 'yes');
    }
});
```

ctx.isSimple()
------------

Проверяет, что объект является примитивом.
```javascript
bh.match('link', function(ctx) {
    ctx.tag(ctx.isSimple(ctx.content()) ? 'span' : 'div');
});
```

ctx.extend()
------------

Аналог функции `extend` в jQuery.

ctx.applyBase()
---------------

Выполняет преобразования данного BEMJSON-элемента остальными шаблонами. Может понадобиться, например, чтобы добавить элемент в самый конец содержимого, если в базовых шаблонах в конец содержимого добавляются другие элементы.

Пример:

```javascript
bh.match('header', function(ctx) {
   ctx.content([
       ctx.content(),
       { elem: 'under' }
   ], true);
});

bh.match('header_float_yes', function(ctx) {
   ctx.applyBase();
   ctx.content([
       ctx.content(),
       { elem: 'clear' }
   ], true);
});
```

ctx.stop()
----------

Останавливает выполнение прочих шаблонов для данного BEMJSON-элемента.

Пример:

```javascript
bh.match('button', function(ctx) {
    ctx.tag('button', true);
});
bh.match('button', function(ctx) {
    ctx.tag('span');
    ctx.stop();
});
```

ctx.generateId()
----------------

Возвращает уникальный идентификатор. Может использоваться, например, чтобы задать соответствие между `label` и `input`.

ctx.param(key[, value[, force]])
--------------------------------

Возвращает/устанавливает параметр текущего BEMJSON-элемента. **force** — задать значение параметра, даже если оно было задано ранее. Например:

```javascript
bh.match('search', function(ctx) {
    ctx.attr('action', ctx.param('action') || '/');
});
```

ctx.tParam(key[, value])
------------------------

Передает параметр вглубь BEMJSON-дерева. Например:

```javascript
bh.match('input', function(ctx) {
    ctx.content({
        elem: 'control'
    }, true);
    ctx.tParam('value', ctx.param('value'));
});

bh.match('input__control', function(ctx) {
    ctx.attr('value', ctx.tParam('value'));
});
```
