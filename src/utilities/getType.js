/**
 * -----------------------------------------------------------
 * 
 * getType, create content-type headers
 * 
 * -----------------------------------------------------------
 */


'use strict';


var extname = require('path').extname;
var mimes   = require('./mimes');


/**
 * Create a full Content-Type header given a MIME type or extension
 *
 * @param  {string} value
 * @return {boolean|string}
 */
function getType (value) {
 	if (!value) {
 		return false; 
 	}

 	var type;

 	if (value.indexOf('/')) {
 		// get the extension ("ext" or ".ext" or full path)
 		var extension = extname('x.' + value).toLowerCase().substr(1);

 		if (!extension) {
 			return false;
 		}

 		return mimes[extension] || false;
 	} else {
 		type = value;
 	}

 	if (!type) {
     	return false;
 	}

 	return type + '; charset=utf-8';
}


/**
 * -----------------------------------------------------------
 * 
 * exports
 * 
 * -----------------------------------------------------------
 */


module.exports = getType;

