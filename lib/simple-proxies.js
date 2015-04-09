module.exports = {
    FileLoader: function() {
        var fileLoader = require('./proxyfileloader');
        return fileLoader;
    },
    DBLoader: function() {
        var dbloader = require('./proxydbloader');
        return dbloader;
    },
    Checker: function() {
        var checker = require('./proxychecker');
        return checker;
    }
};
