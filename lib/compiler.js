var loaderUtils = require('loader-utils');
var globalizeCompiler = require('globalize-config-compiler');

module.exports = function(source) {
    this.cacheable && this.cacheable();
    var query = loaderUtils.getOptions(this) || {};
    var locale = query.locale;
    var sync = query.sync || false;

    var config = this.exec(source, this.resourcePath);
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

            return ret;
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

    compiled = globalizeCompiler(config, {
        context: this.context,
        compilerOptions: {
            template: template
        },
        dependentFile: this.addDependency
    });

    return compiled[locale];
}
