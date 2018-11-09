var {google} = require('googleapis');
var gmail = google.gmail('v1');
function MailUtility(loggerObject) {
    this.loggerObject = loggerObject;
}
/**
 * This method is used to find and delete email
 * @param {String} searchText - Searchtext need to search in the email and delte
 * @param {Object} authorization - It is used to authorize the user
 * @returns {function} cbk - Its a callback with response or error
 */
MailUtility.prototype.findAndDeleteMail= function(searchText, authorization, cbk) {
   var self = this;
   // console.log(gmail.users.messages.list({userId:'me'}));
    getListOfMessagesByQuery(self, searchText, authorization, function(err, messageList){
        if(err) {
            console.log(err);
            cbk(err,null);
        }
        deleteListOfEmail(messageList, authorization, function(err,res){
            if(err){
                cbk(err, null);
            }
            cbk(null, res);
        });
    });
};
/**
 * This method is used to et list message by query "SearchText"
 * @param {Object} self 
 * @param {String} searchText - Searchtext need to search in the email
 * @param {Object} authorization - It is used to authorize the user
 * @param {Array/Object} callback - It is used to return list of message ids or it will return error object
 */
function getListOfMessagesByQuery (self, searchText, authorization, callback) {
    gmail.users.messages.list({userId: 'me', auth:authorization, q:searchText}, function(err,res){
        if(err){
            self.loggerObject.Logger("error", "Error while gettting list of messages based on searchText: "+searchText+" error is :"+err);
            callback(err,null);
        }
       if(res){
        getPageOfMessage(res, searchText, authorization, [],function(err,res){
            if(err){
                self.loggerObject.Logger("error", "Error while getting message list");
            }
            callback(null, res);
        });
       }else {
           self.loggerObject.Logger("info", "There is no project exist at all with searchText : "+searchText);
       }
        
    });
}
/**
 * This method used to get messages page by page until unless it get all the messages(Using Recursive Mehtod)
 * @param {ResultSet} res It is the page By resultSet 
 * @param {String} searchText It is the search text to find the email based on this searchText
 * @param {Object} authorization It is used to authorize
 * @param {Array} resultList List of message
 * @param {resultList} callback List of messages or error to be callback 
 */
var getPageOfMessage = function(res, searchText, authorization, resultList,callback) {
    resultList = resultList.concat(res.data.messages);
    var nextPageToken = res.data.nextPageToken;
    if(nextPageToken) {
        gmail.users.messages.list({userId:'me', pageToken: nextPageToken, 'q':searchText, auth:authorization}, function(err,res){
            if(err){callback(err,null);}
            getPageOfMessage(res, searchText, authorization, resultList, callback);
        });
    } else {
        callback(null, resultList);
    }
}


/**
 * This method is used to delete list of email based on message ids
 * @param {Array} messageList messageList With IDs Array based on searchText
 * @param {Object} authorization It is authorization object to authorize the user
 * @param {function} callback It will be give you empty array or error object in case of error
 */
function deleteListOfEmail(messageList,authorization, callback) {
    var ids = [];
    console.log(messageList);
    messageList.forEach(function(message){
        ids.push(message.id);
    });
    console.log(ids.length);
    if(ids.length!==0) {
        gmail.users.messages.batchDelete({userId:'me',"resource":{ids:ids}, auth:authorization}, function(err,res){
            if(err) {
                callback(err,null);
            }
            callback(null, res.data);
        });
    }
}

module.exports = MailUtility;