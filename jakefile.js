
var Q = require("q");
var childProcess = require("child_process");

var mysqlDumpPath = "C:/mysql/bin/mysqldump.exe";
var hostname = "localhost";
var databaseName = "testtemp";
var username = "root";
var password = "";
var outputFile = "./test.sql";


task("createBackup", function() {

    return Q.nfcall(childProcess.spawn, mysqlDumpPath, ["--host",  hostname, "-u", username, "-p", password, "-r", outputFile, databaseName], {
        stdio: "inherit"
    })
    .then(function(results) {
        var stdout = results[0];
        var stderr = results[1];

        console.log("stdout", stdout);
        console.log("stderr", stderr);
    });
});