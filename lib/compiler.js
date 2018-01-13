var loaderUtils = require('loader-utils');
var globalizeCompiler = require('globalize-config-compiler');
var exec = require('./exec');

module.exports = function(source, map, meta) {
    var callback = this.async();
    this.cacheable && this.cacheable();
    var query = loaderUtils.getOptions(this) || {};
    var locale = query.locale;
    var sync = query.sync || false;
    var resourcePath = this.resourcePath;

    this.loadModule(this.resource, function(err, mSource, mMap, module) {
        if (err) {
            callback(err);
            return;
        }

        var config = exec(this, mSource, resourcePath);

        config.availableLocales = [locale];

        var template;

        if (sync) {
            template = function(params) {
                var deps = 'var Globalize = ' + params.dependencies.map(function(dependency) {
                    return 'require("globalize/dist/' + dependency + '")';
                }).join(';\n');
                return [
                    'module.exports = function(callback) {',
                    deps,
                    '',
                    params.code,
                    '',
                    '    callback(new Globalize("' + locale + '"));',
                    '}'
                ].join('\n');
            };
        } else {
            template = function(params) {
                var deps = '[' + params.dependencies.map(function(dependency) {
                    return '"globalize/dist/' + dependency + '"';
                }).join(', ') + ']';
                return [
                    'module.exports = function(callback) {',
                    '    require(' + deps + ', function(Globalize) {',
                    '',
                    params.code,
                    '',
                    '        callback(new Globalize("' + locale + '"));',
                    '    })',
                    '}'
                ].join('\n');
            };
        }

        try {
            compiled = globalizeCompiler(config, {
                context: this.context,
                compilerOptions: {
                    template: template
                },
                dependentFile: this.addDependency
            });
        } catch(err) {
            callback(err);
            return;
        }

        callback(null, compiled[locale]);
    }.bind(this));
}
