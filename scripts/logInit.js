//create winston object that use for logging
winston = require('winston');

function logInit()
{
}
	
// Wrapper function to store log in database
logInit.prototype.Logger = function (logLevel,logMessage,module) 
{
	console.log("---coming here");
	//If loggingObject is present 
	if(typeof loggingObject == "undefined")
	{
		var loggingObject = {};
		loggingObject['logObject'] = module;				//Load applicationId from session
	}
	else//If loggingObject is empty
	{
		loggingObject['logObject'] = module;					
	}   
	logLevel = logLevel.toLowerCase();
	winston.log(logLevel,logMessage,loggingObject);		// this function store logg in database
}

logInit.prototype.setLogFile = function(logFile)
	{
		console.log(logFile);
        winston.createLogger({
            transports: [
              new winston.transports.Console(),
              new winston.transports.File({ filename: logFile })
            ]
          });
	}
	
module.exports = logInit;