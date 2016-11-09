/**
 * -----------------------------------------------------------
 * 
 * compress, middleware for static file generator
 * 
 * -----------------------------------------------------------
 */


'use strict';


var zlib         = require('zlib');

var empty        = require('./statuses.js').empty;
var isJSON       = require('./isJSON.js');

var regexp       = /^text\/|\+json$|\+text$|\+xml$/i;
var compressible = type => regexp.test(type);


/**
 * Compress, middleware
 *
 * @return {function}
 */
function Compress (options) {
	options = options || {};

	var filter    = options.filter    || compressible,
		threshold = options.threshold || 1024;

	return function (context, next) {
		var request  = context.request,
			response = context.response, 
			body     = response.body;

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

		// don't gzip if less than threshold
		if (response.length < threshold) {
			return next();
		}

		response.set('Content-Encoding', 'gzip');
      	response.res.removeHeader('Content-Length');

      	zlib.gzip(body, (error, result) => {      		
  	   		error ? context.error(error) : context.response.body = result;
  	   		next();
      	});
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