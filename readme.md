
To backup a mysql database to Amazon Glacier, with a path that is readable by Cloudberry S3 explorer:

    node run.js config.js

Where config.js is something like:

    module.exports = {
        mysqlDumpPath: "C:/mysql/bin/mysqldump.exe",
        hostname: "localhost",
        databaseName: "testtemp",
        username: "root",
        password: "",
        vaultName: 'mysql-glacier-backup',
        glacierConfig: {
            "accessKeyId": "...",
            "secretAccessKey": "...",
            "awsAccountId": "...",
            "region": "us-east-1"
        }
    };



awsAccountId should be your account number, of the form "nnnn-nnnn-nnnn", which you might find at https://portal.aws.amazon.com/gp/aws/manageYourAccount


Amazon Javascript SDK examples: http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/examples.html
Amazon SDK verbose help: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/frames.html#!http%3A//docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Glacier_20120601.html