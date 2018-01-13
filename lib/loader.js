var loaderUtils = require('loader-utils');
var exec = require('./exec');

module.exports = function(source, map, meta) {
    var callback = this.async();
    this.cacheable && this.cacheable();
    var query = loaderUtils.getOptions(this) || {};
    var sync = query.sync || false;
    var resourcePath = this.resourcePath;

    this.loadModule(this.resource, function(err, mSource, mMap, module) {
        if (err) {
            callback(err);
            return;
        }

        var config = exec(this, mSource, resourcePath);

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

        callback(null, result.join('\n'));
    }.bind(this));
}
