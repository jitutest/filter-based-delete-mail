var path = require("path");
var logInit = require("./scripts/logInit.js");
var loggerObject = new logInit();

var FileUtilityClass = require("./scripts/FileUtility.js");
var fileUtilityObject = new FileUtilityClass();

var MailUtilityClass = require("./scripts/MailUtility.js");

var AuthorizationClass = require("./scripts/Authorization.js");

const CONFIG_URL = path.join(__dirname, 'configs/config.json');

fileUtilityObject.readFileByUrl(CONFIG_URL, function(err,res){
    var obj = JSON.parse(res);
    const logURL = path.join(__dirname, obj.logURL);;
    loggerObject.setLogFile(logURL);
    var authorizationObj = new AuthorizationClass(loggerObject, fileUtilityObject);
    var mailUtilityObj = new MailUtilityClass(loggerObject);
    const credentialsFileUrl = path.join(__dirname, obj.credentialsFile);
    authorizationObj.authorizeGmail(credentialsFileUrl, function(authorization){
        mailUtilityObj.findAndDeleteMail(obj.searchText, authorization, function(err,res){
            process.exit(1);
        });
    });
    
    
});



