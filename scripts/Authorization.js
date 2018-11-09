var fs = require('fs');
var path = require('path');
var readline = require('readline');
var {google} = require('googleapis');
 
// If modifying these scopes, delete your previously saved credentials
// at TOKEN_DIR/gmail-nodejs.json
var SCOPES = ['https://mail.google.com//'];
 
// Change token directory to your system preference

var TOKEN_PATH =  path.join(__dirname,'gmail-nodejs.json');
 
var gmail = google.gmail('v1');

function Authorization(loggingObject, fileUtilityObj) {
    this.loggingObject = loggingObject;
    this.fileUtilityObj = fileUtilityObj;
   
}

Authorization.prototype.authorizeGmail = function(credentialsUrl, callback) {
    var self = this;
    self.fileUtilityObj.readFileByUrl(credentialsUrl, function(err, result){
        if(err) {callback(err,null);}
        authorize(self, JSON.parse(result), callback);
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(self, credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
 
    var OAuth2 = google.auth.OAuth2;
 
    var oauth2Client = new OAuth2(clientId, clientSecret,  redirectUrl);
 
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
      if (err) {
        getNewToken(self, oauth2Client, callback);
      } else {
        oauth2Client.credentials = JSON.parse(token);
        callback(oauth2Client);
      }
    });
}
/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(self,oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({access_type: 'offline', scope: SCOPES});
    self.loggingObject.Logger("info",'Authorize this app by visiting this url: '+authUrl);
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
   
    rl.question('Enter the code from that page here: ', function(code) {
      rl.close();
      oauth2Client.getToken(code, function(err, token) {
        if (err) {
            self.loggingObject.Logger("error", 'Error while trying to retrieve access token'+err)
            callback(err, null);
        }
        oauth2Client.credentials = token;
        storeToken(token, self);
        callback(oauth2Client);
      });
    });
  }
   
  /**
   * Store token to disk be used in later program executions.
   *
   * @param {Object} token The token to store to disk.
   */
  function storeToken(token, self) {
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    self.loggingObject.Logger("info", 'Token stored to ' + TOKEN_PATH);
  }

module.exports = Authorization;