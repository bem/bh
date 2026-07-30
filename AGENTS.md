# AGENTS.md

## Project overview

BH is a small JavaScript template engine that transforms BEMJSON into HTML. The
package supports Node.js 0.10 and newer, so production code must stay compatible
with ES5 syntax.

## Code map

- `index.js` is the package entry point and exports the `BH` constructor.
- `lib/bh.js` contains the engine, matcher compiler, BEMJSON traversal, and HTML
  renderer.
- `test/` contains the Mocha behavioral test suite. Test files are grouped by
  the public method or context helper they specify.
- `README.md` is the canonical user documentation. `README.ru.md` is its
  automatically generated Russian translation and must not be edited directly.
- `CONTRIBUTION.md` describes the contribution process.

## Development workflow

Install the pinned development dependencies with `npm install`.

- Run the complete validation suite: `npm test`.
- Run unit tests without coverage: `npm run unit-test`.
- Run static analysis: `npm run jshint`.
- Run the style checker: `npm run check-style`.
- Generate the local coverage report: `npm run unit-test-coverage`.

`coverage/` is generated output and must not be committed.

## Change guidelines

- Preserve Node.js 0.10 compatibility: do not use `let`, `const`, arrow
  functions, classes, template literals, or other newer syntax in runtime code
  and tests.
- Treat the generated matcher as a performance-sensitive implementation detail.
  Preserve matcher order, the single-application markers stored on BEMJSON
  nodes, replacement-node processing, and `beforeEach`/`afterEach` behavior.
- Preserve BEMJSON traversal semantics: inherited block data, element modifiers,
  nested-array flattening, sibling positions, and optional infinite-loop
  detection.
- Add or update a focused test in `test/` for every behavior change. Test names
  should state the observable outcome.
- Write all human-readable project text in English. This includes source-code
  comments and JSDoc, documentation, test names and messages, changelog entries,
  commit messages, branch names, and pull request titles and descriptions.
- The only language exception is the generated `README.ru.md`. Update
  `README.md` first, then regenerate the Russian translation when user-facing
  behavior or examples change.
- Follow the existing four-space indentation and single-quote style. The full
  validation suite is the source of truth for lint and formatting rules.
