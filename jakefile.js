
var Q = require("q");
var sprintf = require("sprintf").sprintf;
var childProcess = require("child_process");

var mysqlDumpPath = "C:/mysql/bin/mysqldump.exe";
var hostname = "localhost";
var databaseName = "testtemp";
var username = "root";
var password = "";
var outputFile = "./test.sql";


task("createBackup", function() {

    var now = new Date();

    var filename = sprintf("%s.%04d-%02d-%02d.%02d-%02d-%02d.sql", databaseName, now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());

    console.log("Generating backup", filename);

    var mysqldumpArgs = ["--host",  hostname, "-u", username, "-r", outputFile, databaseName];

    if (password !== null) {
        mysqldumpArgs.splice(0,0, "--password=" + password);
    }

    return Q.nfcall(childProcess.spawn, mysqlDumpPath, mysqldumpArgs, {
        stdio: "inherit"
    })
    .then(function(results) {
        var stdout = results[0];
        var stderr = results[1];

        console.log("stdout", stdout);
        console.log("stderr", stderr);
    });
});