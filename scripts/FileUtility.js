const fs = require('fs');

function FileUtility() {

}
/**
 * Read File content by URL 
 */
FileUtility.prototype.readFileByUrl = function(url, callback) {
    try{
        fs.readFile(url, "utf8", function(err,result){
            callback(err, result);
        });
    } catch(err){
        callback(err, null);
    }
   
}
module.exports = FileUtility;