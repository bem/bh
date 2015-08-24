# Changelog

## 3.3.2
- Fixed bug with `ctx.js()` (#162).

## 3.3.1
- Fixed bug with `ctx.js()` (#160).

## 3.3.0
- Do not add `i-bem` class to element with `js`.

## 3.2.4
- Revert 3.2.1 and 3.2.2 patches.

## 3.2.3
- Speed improvement by better escaping (#111).
- `toHtml`: add mod === 0 to output (#110).

## 3.2.2
- Do not add `i-bem` class to mixed elements with `js`.

## 3.2.1
- Do not add `i-bem` class to element with `js` (#106).

## 3.2.0
- Escape content when option `escapeContent` enabled (#97).
- Some fixes.

## 3.1.4
- Ignore `mix` and `js` when `bem` is false (#98).

## 3.1.3
- TypeError when using elemMod matcher (#93).

## 3.1.2
- Falsy `return` should provide empty string result.

## 3.1.1
- `apply()`: do not fail on `undefined` (#83).
