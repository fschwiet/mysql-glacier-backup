
var AWS = require('aws-sdk');
var fs = require("fs");
var Q = require("q");
var sprintf = require("sprintf").sprintf;
var childProcess = require("child_process");
var iso8601 = require('iso8601');

var config = {
    mysqlDumpPath: "C:/mysql/bin/mysqldump.exe",
    hostname: "localhost",
    databaseName: "testtemp",
    username: "root",
    password: "",
    vaultName: 'mysql-glacier-backup'
};

var glacierConfigLocation = "./glacier.config";

function writeBackup(glacierConfig, vaultName, path, date, content) {
    
    var glacier;

    return Q()
    .then(function() {
        glacier = new AWS.Glacier(glacierConfig);    
        return Q.ninvoke(glacier, "createVault", { vaultName: vaultName});
    })
    .then(function() {

        var description = {
            Path: path,
            UTCDateModified: iso8601.fromDate(date).replace(/[:-]/g, ''),
            Flags: 0
        };

        return Q.ninvoke(glacier, "uploadArchive", { vaultName: vaultName, body: content, archiveDescription : JSON.stringify(description)});
    })
    .then(function(data){
    });
}

var now = new Date();

var filename = sprintf("%s.%04d-%02d-%02d.%02d-%02d-%02d.sql", config.databaseName, now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());

console.log("Generating backup", filename);

var mysqldumpArgs = ["--host",  config.hostname, "-u", config.username, config.databaseName];

if (config.password !== null) {
    mysqldumpArgs.splice(0,0, "--password=" + config.password);
}

return Q()
.then(function() {
    return Q.ninvoke(childProcess, "execFile", config.mysqlDumpPath, mysqldumpArgs, {
        stdio: "inherit"
    });
}) 
.then(function(results) {
    var stdout = results[0];
    var stderr = results[1];
    console.log("File length:", stdout.length);

    return Q.ninvoke(fs, "readFile", glacierConfigLocation, "utf8")
    .then(function(glacierConfig) {
        return writeBackup(JSON.parse(glacierConfig), config.vaultName, filename, now, stdout);
    });
})
.fail(function(Err) {
    console.log("Error:", Err);
    process.exit(1);
});
