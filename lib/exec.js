var Module = require("module");

module.exports = function exec(loader, code, filename) {
    var m = new Module(filename, loader);
    m.paths = Module._nodeModulePaths(loader.context);
    m.filename = filename;
    m._compile(code, filename);
    return m.exports;
}
