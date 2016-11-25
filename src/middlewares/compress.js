/**
 * -----------------------------------------------------------
 * 
 * compress, middleware compressing responses
 * 
 * -----------------------------------------------------------
 */


'use strict';


var zlib         = require('zlib');
var empty        = require('../utilities/statuses').empty;
var isJSON       = require('../utilities/isJSON');

var regexp       = /^text\/|\+json$|\+text$|\+xml$/i;
var compressible = type => regexp.test(type);


/**
 * -----------------------------------------------------------
 * 
 * constructors
 * 
 * -----------------------------------------------------------
 */


/**
 * Compress, middleware
 *
 * @return {function}
 */
function Compress (options) {
	options = options || {};

	var filter    = options.filter    || compressible;
	var threshold = options.threshold || 1024;

	return function (context, next) {
		var request  = context.request;
		var response = context.response; 
		var body     = response.body;

		if (
			!body || 
			empty[response.status] || 
			request.method === 'HEAD' || 
			!filter(response.type)
		) {
			return next();
		}

		// json
		if (isJSON(body)) {
			body = this.body = JSON.stringify(body);
		}

		// only gzip if greater than threshold
		if (response.length > threshold) {
			response.set('Content-Encoding', 'gzip');
	      	response.remove('Content-Length');

	      	zlib.gzip(body, function (error, result) {
	  	   		!error ? response.body = result : context.error(error);
	  	   		next();
	      	});	
		} else {
			return next();
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


module.exports = Compress;

