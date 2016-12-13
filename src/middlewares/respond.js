/**
 * -----------------------------------------------------------
 * 
 * response - sends the response to the client
 * 
 * -----------------------------------------------------------
 */


'use strict';


var Stream    = require('stream');
var utilities = require('../utilities');

var statuses  = utilities.statuses;
var style     = `<style>
	body { 
		font-family: sans-serif; 
		text-align: center;
		padding: 80px 20px 0;
		margin: 0;
		font-size: 16px;
		background: #000;
	}
	h1 { 
		font-weight: bold;
		font-size: 8em;
		color: #FFF;
		margin: 0;
	}
	p {
		font-family: 'AndaleMono', monospace;
		color: #1ff042;
	    font-size: 0.9em;
	    line-height: 200%;
	    letter-spacing: 0.15em;
	}
</style>`.replace(/[\t\n]|  +/g, '').replace(/(?:| +)({|}|;|:|,) +/g, '$1');


/**
 * -----------------------------------------------------------
 * 
 * constructors
 * 
 * -----------------------------------------------------------
 */


/**
 * response helper
 *
 * @param {Object} context
 */
function Respond (context, control) {
	if (control === 1) {
		return;
	}

	var response = context.response;
	var body     = response.body;
	var code     = response.status;
	var res      = context.res;

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
		if (!res.headersSent) {
			body = pretty(code + ' - ' + response.message, code, statuses[code]);

			res.setHeader('Content-Type', 'text/html');
			res.setHeader('Content-Length', Buffer.byteLength(body));

			return res.end(body);
		} else {
			return res.end(response.message || ''+code);
		}
	}

	// responses
	if (typeof body === 'string' || Buffer.isBuffer(body)) {
		// string/buffer
		return res.end(body);
	} else if (body instanceof Stream) {
		// TODO, compress text/html streams
		// if (response.type === 'text\html') {
		// 		var gzip = zlib.createGzip();
		// 		body.pipe(gzip).pipe(res);
		// 	}

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
 * methods
 * 
 * -----------------------------------------------------------
 */


/**
 * pretty print html for uncaught error responses
 * 
 * @param  {Object} req - request object
 * @return {Object}    
 */
function pretty (title, code, body) {
	return (
		'<!doctype html><meta name="viewport" content="width=device-width">'+
		'<title>'+title+
		'</title><div><h1>'+code+
		'</h1><p>'+body+
		'</p><div>'+style
	);
}


/**
 * -----------------------------------------------------------
 * 
 * exports
 * 
 * -----------------------------------------------------------
 */


module.exports = Respond;

