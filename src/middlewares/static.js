/**
 * -----------------------------------------------------------
 * 
 * static, middleware for serving static file with compression
 * 
 * -----------------------------------------------------------
 */


'use strict';


var fs           = require('fs');
var path         = require('path');
var utilities    = require('../utilities');

var extname      = path.extname;
var mimes        = utilities.mimes;
var walk         = utilities.walk;
var development  = process.env.NODE_ENV === void 0 || process.env.NODE_ENV !== 'production';


/**
 * -----------------------------------------------------------
 * 
 * constructors
 * 
 * -----------------------------------------------------------
 */


/**
 * static, middleware
 *
 * @param  {string}          base
 * @param  {function|string} handler
 * @return {function}
 */
function Static (base, handler) {
	var directory = path.resolve(base);
	var start     = directory.length;
	var stats     = fs.statSync(directory);
	var modified  = stats.mtime;
	var handle    = typeof handler === 'function';
	var cache     = path.join(directory, '.cache');
	var threshold = 1024;

	// create if cache directory does not exists
	!fs.existsSync(cache) && fs.mkdirSync(cache);

	var files = walk(directory, Object.create(null), start, cache, threshold, true);

	// keep track of changes to public assets in development enviroment
	if (development) {
		(function () {
			// watch directory
			fs.watch(directory, function (event, filename) {
			    try {
			    	files = walk(directory, Object.create(null), 0, cache, threshold, true);
			    } catch (err) {
			    	console.log(err);
			    }
			});
		}());
 	}

	// return middleware
	return function (context, next) {
		var response = context.response;
		var request = context.request;

		// don't try to send a response if one has already been sent
		if (response.body != null) {
			next(); 
			return;
		}

		// get url
		var uri = context.req.url;
		// get file stats
		var filestat = files[uri];

		// if a file exits
		if (filestat != null) {
			// file exists
			var filepath;

			// if file has gzipped cache
			if (filestat.gzipped) {
				filepath = filestat.gzip;
				response.set('Content-Encoding', 'gzip');
				response.remove('Content-Length');
			} else {
				filepath = filestat.path;
			}

			// set content-type
			response.type = filestat.ext;

			// set content-length
			response.length = filestat.size;

			// assign response body to a stream
		    response.body = fs.createReadStream(filepath);

		    // next middleware
		    next(0);
		} else {
			// file does not exist
			if (handle) {
				// handler provider
				response.body = handler(uri);

				// signals an end of the middleware chain
				next(0);
			} else {
				// if it's a request for a static file 
				// server 404 and end the middleware chain
				if (mimes[request.ext]) {
					// signals an end of the middleware chain
					next(0);
				} else {
					next();
				}	
			}
		}
	}
}


/**
 * -----------------------------------------------------------
 * 
 * exports
 * 
 * -----------------------------------------------------------
 */


module.exports = Static;

