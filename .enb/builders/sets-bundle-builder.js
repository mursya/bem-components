var path = require('path');

function one(file, scope) {
    var filename = file.name;
    var node = filename.split('.')[0];

    if(filename === 'blocks') {
        filename = [scope, 'blocks'].join('.');
    } else if(file.suffix === 'blocks') {
        filename = 'blocks';
    }

    return {
        targetPath : path.join(scope, node, filename),
        sourcePath : file.fullname
    };
}

module.exports = function(options) {
    options = options || {};

    var sublevelSuffixes = options.sublevelSuffixes || [];

    return function(file) {
        if(file.isDirectory && ~sublevelSuffixes.indexOf(file.suffix)) {
            var files = file.files;
            var scope = file.name.split('.')[0];

            return files && files.length && files.map(function(file) {
                return one(file, scope);
            }).filter(function(file) {
                return file;
            });
        }

        return false;
    };
};
