Globalize-config-loader is a loader for [globalize-config-compiler](https://github.com/nkovacs/globalize-config-compiler).
It will convert a configuration object (e.g. a json file loaded with json-loader) into a function that returns a new Globalize instance.

## Installation

Install the loader, globalize, and cldr-data:

    npm install --save-dev globalize-config-loader globalize cldr-data

## Usage

Create a function such as this in your code:

```js
function getGlobalize(locale, callback) {
    require('globalize-config!json!./locale/config.json')(locale, function(initFn) {
        initFn(callback);
    });
}
```

`callback` will be called with a single parameter, a Globalize instance
set to `locale` with the formatters and parsers in `config.json`.

By default, the code is [split](https://webpack.github.io/docs/code-splitting.html) into
separate chunks, one for the globalize runtime, and one for the locale-specific data for each locale.
These chunks are loaded when first needed.
You can add `sync=true` to the loader's query string to disable code splitting,
but note that this will compile all the locales in the configuration into the calling chunk:

```js
require('globalize-config?sync=true!json!./locale/config.json')(locale, function(initFn) { ... });
```
