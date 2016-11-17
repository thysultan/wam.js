/**
 * -----------------------------------------------------------
 * 
 * response - sends the response to the client
 * 
 * -----------------------------------------------------------
 */


'use strict';

var Stream   = require('stream');

var statuses = require('./statuses');


/**
 * response helper
 *
 * @param {Object} context
 */
function respond (context) {
	var response = context.response,
		body     = response.body,
		code     = response.status,
		res      = context.res;

	// can't write after response finished
	if (!response.writable) {
		return;
	}

	// ignore body for empty requests
	if (statuses.empty[code]) {
		response.body = null;

		return res.end();
	}

	if (response.method === 'HEAD') {
		if (!res.headersSent && isJSON(body)) {
	    	response.length = (
	    		Buffer.byteLength(JSON.stringify(body))
	    	);
	  	}

  		return res.end();
	}

	// status body
	if (body == null) {
		body = response.message || String(code);

		if (!res.headersSent) {
			response.type   = 'text';
			response.length = Buffer.byteLength(body);
		}

		// i.e Not Found
		return res.end(body);
	}

	// responses
	if (typeof body === 'string' || Buffer.isBuffer(body)) {
		// string/buffer
		return res.end(body);
	} else if (body instanceof Stream) {
		// stream
		return body.pipe(res);
	} else {
		// json
		body = JSON.stringify(body);

		// re-calculate length
		if (!res.headersSent) {
			response.length = Buffer.byteLength(body);
		}

		res.end(body);
	}
}


/**
 * -----------------------------------------------------------
 * 
 * exports
 * 
 * -----------------------------------------------------------
 */


module.exports = respond;
