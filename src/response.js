'use strict';


/**
 * ---------------------------------------------------------------------------------
 * 
 * dependencies
 * 
 * ---------------------------------------------------------------------------------
 */


var utilities = require('./utilities');

var statuses  = utilities.statuses;
var getType   = utilities.type;
var typeis    = utilities.typeis;


/**
 * ---------------------------------------------------------------------------------
 * 
 * constructors
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * bootstrap
 *
 * @return {Response}
 */
function Bootstrap () {
	return Response;
}


/**
 * response constructor
 * 
 * @param {Object} response
 */
function Response () {
 	return Object.defineProperties({ 		
 		req: null,
 		res: null,
 		app: null,
 		ctx: null,
 		request: null,

 		_body: null,
 		_explicit: null,
 		_headers: {},

 		is: is,
 		get: get,
 		set: set,
 		remove: remove
 	}, {
 		type:         { get: typeGetter, set: typeSetter },
		body:         { get: bodyGetter, set: bodySetter },
		length:       { get: lengthGetter, set: lengthSetter },
		message:      { get: messageGetter, set: messageSetter },
		header:       { get: headerGetter },
		status:       { get: statusGetter, set: statusSetter },
		lastModified: { get: lastModifiedGetter, set: lastModifiedSetter },
		socket:       { get: socketGetter },
		writable:     { get: writableGetter },
		headerSent:   { get: headerSentGetter }
	});
}


/**
 * ---------------------------------------------------------------------------------
 * 
 * methods
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * check if response is of listed types, identical to `this.request.is()`.
 *
 * @param  {string|string[]} types...
 * @return {boolean|string}
 */
function is (types) {
	var type = this.type;

	if (!types) {
		return type || false;
	}

	return typeis(types, type);
}

/**
 * retreive response header, i.e get('Content-Type') => "text/plain"
 * 
 * @param  {string} name
 * @return {string}
 */
function get (name) {
 	return this.header[name.toLowerCase()] || '';
}

/**
 * assign header value pairs
 *
 * @param {string|Object|any[]} name
 * @param {string}              value
 */
function set (name, value){
	if (arguments.length === 2) {	
		value = value.constructor === Array ? value.map(String) : String(value);

		// normalize name case, assign to cache
		this._headers[name.toLowerCase()] = value;

		this.res.setHeader(name, value);
	} else {
		var keys = keys = Object.keys(name);

		for (var i = 0, length = keys.length; i < length; i = i + 1) {
			var key = keys[i];
			this.set(key, name[key]);
		}
	}
}


/**
 * remove header pair
 *
 * @param {string} name
 */
function remove (name) {
    this.res.removeHeader(name);
}


/**
 * ---------------------------------------------------------------------------------
 * 
 * getters and setters
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * assign Content-Type response header when it doesn't contain a charset
 * 
 * @param {string} type
 */
function typeSetter (value) {
	value = getType(value) || false;

	value ? this.set('Content-Type', value) : this.remove('Content-Type');
}

/**
 * retreive Content-type response header
 *
 * @return {string}
 */
function typeGetter () {
	var contentType = this.get('Content-Type');

	return !contentType ? '' : contentType.split(';')[0];
}

/**
 * retreive response body
 * 
 * @return {string}
 */
function bodyGetter () {
	return this._body;
}

/**
 * assign response body
 * 
 * @param {string} value
 */
function bodySetter (value) {
	this._body = value;

	// no content
	if (null == value) {
		if (!statuses.empty[code]) {
			this.status = 204;
		}

		// strip headers
		this.remove('Content-Type');
		this.remove('Content-Length');
		this.remove('Transfer-Encoding');

		return;
	}

	if (!this._explicit) {
		this.status = 200;
	}

	// set the content-type only if not yet set
    var setType = !this.header['content-type'];

    // string
	if (typeof value === 'string') {
		if (setType) {
			// if the first non-white space character is <, html, else text
			this.type = /^\s*</.test(value) ? 'html' : 'text';
		}

		this.length = Buffer.byteLength(value);

		return this._body;
	}

	// buffer
    if (Buffer.isBuffer(value)) {
  		if (setType) {
  			this.type = 'bin';
  		}

  		this.length = value.length;
		
		return this._body;
    }

    // json
    this.remove('Content-Length');
    this.type = 'json';

    return this._body;
}

/**
 * retreive response length
 * 
 * @return {number}
 */
function lengthGetter () {
	var length = this.header['content-length'];
    var body   = this.body;

	if (length == null) {
		length = !body ? 0 : Buffer.byteLength(body);
	}

    return ~~length;
}

/**
 * assign response length
 * 
 * @param {} value [description]
 */
function lengthSetter (value) {
	this.set('Content-Length', value);
}

/**
 * retreive response message
 * 
 * @return {string}
 */
function messageGetter () {
    return this.res.statusMessage || statuses[this.status];
}

/**
 * assign response message
 * 
 * @param {string} message
 */
function messageSetter (value) {
    this.res.statusMessage = value;
}

/**
 * retreive response status
 * 
 * @return {number}
 */
function statusGetter () {
	return this.res.statusCode;
}

/**
 * assign response status
 * 
 * @param {number} code
 */
function statusSetter (code) {
	this._explicit     = true;

    this.res.statusCode    = code;
    this.res.statusMessage = statuses[code];

    if (this.body && statuses.empty[code]) {
    	this.body = null;
    }
}

/**
 * retreive response header
 * 
 * @return {string}
 */
function headerGetter () {
	return this._headers || {};
}

/**
 * set Last-Modified date using a string or a Date
 *
 * @param {string|Date} value
 */
function lastModifiedSetter (value) {
	var code = (typeof value).charCodeAt(0);

	// if string/number
	if (code === 115 || code === 110) {
		value = new Date(value);
	}

	this.set('Last-Modified', value.toUTCString());
}

/**
 * get the Last-Modified date in Date form, if it exists
 *
 * @return {Date}
 */
function lastModifiedGetter () {
	var date = this.get('last-modified');

	if (date) {
		return new Date(date);
	}
}


/**
 * return the request socket
 *
 * @return {Connection}
 */
function socketGetter () {
	return this.req.socket;
}

/**
 * check if the request is writable
 *
 * @return {boolean}
 */
function writableGetter () {
	// response finished
	if (this.res.finished) {
		return false;
	}

  	var socket = this.res.socket;

  	// pending response, still writable
	if (!socket) {
  		return true;
	}

	return socket.writable;
}

/**
 * check if header has been written to the socket
 *
 * @return {boolean}
 */
function headerSentGetter () {
	return this.res.headersSent;
}


/**
 * ---------------------------------------------------------------------------------
 * 
 * exports
 * 
 * ---------------------------------------------------------------------------------
 */


module.exports = Bootstrap();

