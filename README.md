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

Добавим элемент `before` в начало, а `after` в конец содержимого блока `header`:

```javascript
bh.match('header', function(ctx) {
    ctx.content = [
        { elem: 'before' },
        ctx.content,
        { elem: 'after' }
    ];
});
```

Добавим блок `before-button` перед блоком `button`:

```javascript
bh.match('button', function(ctx) {
    return [
        { block: 'before-button' },
        ctx
    ];
});
```

Утилиты
=======

В `bh.utils` содержится ряд вспомогательных методов для работы с BEMJSON:

bh.utils.position()
-------------------
bh.utils.isFirst()
-------------------
bh.utils.isLast()
-------------------

**bh.utils.position()** возвращает позицию текущего bemjson-элемента в рамках родительского.
**bh.utils.isFirst()** возвращает true, если текущий bemjson-элемент первый в рамках родительского bemjson-элемента.
**bh.utils.isLast()** возвращает true, если текущий bemjson-элемент последний в рамках родительского bemjson-элемента.

Пример:
```javascript
bh.match('list__item', function(ctx) {
    ctx.mods.pos = bh.utils.position();
    if (bh.utils.isFirst()) {
        ctx.mods.first = 'yes';
    }
    if (bh.utils.isLast()) {
        ctx.mods.last = 'yes';
    }
});
```

bh.utils.extend()
-----------------

Аналог функции `extend` в jQuery.

bh.utils.apply(ctx)
-------------------

Выполняет преобразования для переданного bemjson-элемента. Может понадобиться, например, чтобы добавить элемент в самый конец содержимого, если в базовых шаблонах в конец содержимого добавляются другие элементы.

**ВАЖНО**: Эта функция может работать медленно, по возможности избегайте ее.

Пример:

```javascript
bh.match('header', function(ctx) {
   ctx.content = [
       ctx.content,
       { elem: 'under' }
   ];
});

bh.match('header_float_yes', function(ctx) {
   bh.utils.apply(ctx);
   ctx.content = [
       ctx.content,
       { elem: 'clear' }
   ];
});
```

bh.utils.generateId()
---------------------

Возвращает уникальный идентификатор. Может использоваться, например, чтобы задать соответствие между `label` и `input`.

bh.utils.tParam(key[, value])
-----------------------------

Передает параметр вглубь BEMJSON-дерева. Например:

```javascript
bh.match('input', function() {
    ctx.content = {
        elem: 'control'
    };
    bh.utils.tParam('value', ctx.value);
});

bh.match('input__control', function() {
    ctx.value = bh.utils.tParam('value');
});
```
