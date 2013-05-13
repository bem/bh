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

Демо
----

Посмотреть вот-прям-щас: http://xxx-bh-help.mdevils.alexa.maps.dev.yandex.ru/index.html

Метрики
-------

Скорость обработки BEMJSON (1000 итераций).
```javascript
BH - 865ms (1156 times per second)
bemhtml - 3103ms (322 times per second)
BEM.HTML - 1356ms (737 times per second)
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

Функции для работы с BEMJSON ( **матчеры** ) объявляются через метод `match`. В теле функций описывается логика преобразования BEMJSON.

Синтаксис:

```javascript
void bh.match({String} expression, function({Ctx} ctx) {
    //.. actions
});
```

Ниже в этом документе можно найти перечень методов класса Ctx. Дальше пойдем по примерам.

Например, зададим блоку `button` тег `button`, а блоку `input` тег `input`:

```javascript
module.exports = function(bh) {
    bh.match('button', function(ctx) {
        ctx.tag('button');
    });
    bh.match('input', function(ctx) {
        ctx.tag('input');
    });
};
```

Теперь нам нужна псевдо-кнопка. То есть, если у кнопки модификатор `pseudo` равен `yes`, то нужен тег `a` и атрибут `role="button"`:

```javascript
module.exports = function(bh) {
    bh.match('button_pseudo_yes', function(ctx) {
        ctx.tag('a');
        ctx.attr('role', 'button');
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
    ctx.mod('state', 'closed');
});
```

Замиксуем `form` в `search-form`:

```javascript
bh.match('search-form', function(ctx) {
    ctx.mix([{ block: 'form' }]);
});
```

Установим класс для `b-page`:

```javascript
bh.match('b-page', function(ctx) {
    ctx.cls('i-ua_js_no i-ua_css_standard');
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

Как преобразовать json другим матчером?
---------------------------------------

Это возможно в BH. Но, пожалуйста, не делайте этого. Пожалейте тех, кто после вас столкнется с горой ошибок из-за того, что поменялся матчер, который вы неявно использовали. Я рекомендую класть общий функционал в объект `bh.lib` и расшаривать общие методы обработки данных вместо того, чтобы "обманывать систему".

Окей, вы все это прочитали, но остались непреклонны?

```javascript
bh.match('corners', function(ctx) {
    ctx.content([
        ctx.content(),
        { elem: 'tl' },
        { elem: 'tr' },
        { elem: 'bl' },
        { elem: 'br' }
    ], true);
});

bh.match('button', function(ctx) {
    ctx.applyCtx({ block: 'corners' });
    ctx.mix([{ block: 'corners' }]);
    // Crossing fingers.
});
```

Но лучше использовать другой подход:

```javascript
bh.lib.corners = bh.lib.corners || {};
bh.lib.corners.add = function(ctx) {
    ctx.mix([{ block: 'corners' }]);
    ctx.content([
        ctx.content(),
        { block: 'corners', elem: 'tl' },
        { block: 'corners', elem: 'tr' },
        { block: 'corners', elem: 'bl' },
        { block: 'corners', elem: 'br' }
    ], true);
});

bh.match('button', function(ctx) {
    bh.lib.corners.add(ctx);
});
```


Класс Ctx
=========

Инстанции класса `Ctx` передаются во все матчеры. Рассмотрим методы класса:

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
});

bh.match('input_islands_yes', function(ctx) {
    ctx.mod('native', '', true);
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

ctx.mix([value[, force]])
------------------------

Возвращает/устанавливает значение mix в зависимости от аргументов.
При установке значения, если **force** равен **true**, то переданный микс заменяет прежнее значение, в противном случае миксы складываются.

```javascript
bh.match('button_pseudo_yes', function(ctx) {
    ctx.mix([{block: 'b-link'}]);
});
```

ctx.bem([value[, force]])
------------------------

Возвращает/устанавливает значение bem в зависимости от аргументов. **force** — задать значение bem даже если оно было задано ранее.
Если bem имеет значение true, то для элемента не будут генерироваться BEM-классы.

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

**ctx.position()** возвращает позицию текущего bemjson-элемента в рамках родительского.
**ctx.isFirst()** возвращает true, если текущий bemjson-элемент первый в рамках родительского bemjson-элемента.
**ctx.isLast()** возвращает true, если текущий bemjson-элемент последний в рамках родительского bemjson-элемента.

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

ctx.extend()
------------

Аналог функции `extend` в jQuery.

ctx.applyCtx()
---------------

Выполняет преобразования данного bemjson-элемента остальными матчерами. Может понадобиться, например, чтобы добавить элемент в самый конец содержимого, если в базовых шаблонах в конец содержимого добавляются другие элементы.

Пример:

```javascript
bh.match('header', function(ctx) {
   ctx.content([
       ctx.content(),
       { elem: 'under' }
   ], true);
});

bh.match('header_float_yes', function(ctx) {
   ctx.applyCtx();
   ctx.content([
       ctx.content(),
       { elem: 'clear' }
   ], true);
});
```

ctx.generateId()
----------------

Возвращает уникальный идентификатор. Может использоваться, например, чтобы задать соответствие между `label` и `input`.

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
