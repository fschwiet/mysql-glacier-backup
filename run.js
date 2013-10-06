var childProcess = require("child_process");
var fs = require("fs");
var path = require("path");

var AWS = require('aws-sdk');
var iso8601 = require('iso8601');
var Q = require("q");
var sprintf = require("sprintf").sprintf;

if (process.argv.length < 3) {
    console.warn("Expected first parameter to be a config file.");
    process.exit(-1);
}

var config = require(path.resolve(process.argv[2]));

var now = new Date();

var filename = sprintf("%s.%04d-%02d-%02d.%02d-%02d-%02d.sql", config.databaseName, now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());

console.log("Generating backup", filename);

var mysqldumpArgs = getMysqlDumpParameters(config.hostname, config.username, config.password, config.databaseName);

Q()
.then(function() {
    return Q.ninvoke(childProcess, "execFile", config.mysqlDumpPath, mysqldumpArgs, {
        stdio: "inherit",
        maxBuffer: 1024 * 1024 * 200
    });
}) 
.then(function(results) {
    var stdout = results[0];
    var stderr = results[1];
    console.log("Generated file length:", stdout.length);

    return writeBackup(config.glacierConfig, config.vaultName, filename, now, stdout);
})
.then(function() {
    console.log("Done.");
})
.fail(function(Err) {
    console.log("Error:", Err);
    process.exit(1);
});


function getMysqlDumpParameters(hostname, username, password, databaseName) {
    var result = ["--host",  hostname, "-u", username, databaseName];

    if (config.password !== null) {
        result.splice(0,0, "--password=" + password);
    }

    return result;
}


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

        console.log("uploading to archive", vaultName);

        return Q.ninvoke(glacier, "uploadArchive", { vaultName: vaultName, body: content, archiveDescription : JSON.stringify(description)});
    });
}
