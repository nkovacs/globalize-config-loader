var loaderUtils = require('loader-utils');

module.exports = function(source) {
    this.cacheable && this.cacheable();
    var query = loaderUtils.parseQuery(this.query);

    var sync = query.sync || false;

    var config = this.exec(source, this.resourcePath);

    var remainingRequest = loaderUtils.getRemainingRequest(this);

    var options = [];
    config.availableLocales.forEach(function(submodule) {
        options.push({
            submodule: submodule,
            loader: loaderUtils.stringifyRequest(this,
                '!!' + require.resolve('./compiler')
                    + '?sync=' + (sync ? 'true' : 'false')
                    + '&locale=' + submodule
                + '!' + remainingRequest
            )
        });
    });

    var result = [
        'module.exports = function(locale, cb) {',
        '    switch (locale) {',
        options.map(function(value) {
            return [
                '        case ' + JSON.stringify(value.submodule) + ':',
                sync
              ? '            cb(require(' + value.loader + '));'
              : '            require.ensure([], function(require) { cb(require(' + value.loader + ')); });',
                '            break;'
            ].join('\n');
        }).join('\n'),
        '    default:',
        '        throw new Error("Cannot find module " + locale + ".");',
        '    }',
        '}'
    ];

    return result.join('\n');
}
