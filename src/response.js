/**
 * -----------------------------------------------------------
 * 
 * response
 * 
 * -----------------------------------------------------------
 */


'use strict';


var utilities = require('./utilities/index.js');

var statuses  = utilities.statuses;
var getType   = utilities.getType;
var isType    = utilities.isType;
var isJSON    = utilities.isJSON;


/**
 * -----------------------------------------------------------
 * 
 * constructors
 * 
 * -----------------------------------------------------------
 */


/**
 * response constructor
 * 
 * @param {Context}
 */
function Response () {
	this.req       = null;
	this.res       = null;
	this.app       = null;
	this.ctx       = null,
	this.request   = null;
	this._body     = null;
	this._explicit = null;
	this._headers  = {};
}

/**
 * Response prototype
 * 
 * @type {Object}
 */
Response.prototype = Object.defineProperties({
	is:           is,
	get:          get,
	set:          set,
	remove:       remove
}, {
	// getters and setters
	type:         type(),
	body:         body(),
	length:       length(),
	message:      message(),
	header:       header(),
	status:       status(),
	lastModified: lastModified(),
	socket:       socket(),
	writable:     writable(),
	headerSent:   headerSent()
});


/**
 * -----------------------------------------------------------
 * 
 * methods
 * 
 * -----------------------------------------------------------
 */


/**
 * check if response is of listed types, 
 * identical to `this.request.is()`.
 *
 * @param  {string|string[]} types...
 * @return {boolean|string}
 */
function is (types) {
	var type = this.type;

	if (!types) {
		return type || false;
	}

	return isType(types, type);
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
		value = (value.map && value.map(String)) || String(value);

		// normalize name case, assign to cache
		this._headers[name.toLowerCase()] = value;

		this.res.setHeader(name, value);
	} else {
		var keys = Object.keys(name);

		for (var i = 0, length = keys.length; i < length; i++) {
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
 * type getter and setter
 */
function type () {
	return {
		/**
		 * retreive Content-type response header
		 *
		 * @return {string}
		 */
		get: function get () {
			var contentType = this.get('Content-Type');

			return !contentType ? '' : contentType.split(';')[0];
		},
		/**
		 * assign Content-Type response header 
		 * when it doesn't contain a charset
		 * 
		 * @param {string} type
		 */
		set: function set (value) {
			value = getType(value) || false;

			if (value) {
				this.set('Content-Type', value);
			} else {
				this.remove('Content-Type');
			}
		}
	}
}


/**
 * body getter and setter
 */
function body () {
	return {
		/**
		 * retreive response body
		 * 
		 * @return {string}
		 */
		get: function get () {
			return this._body;
		},
		/**
		 * assign response body
		 * 
		 * @param {string} value
		 */
		set: function set (value) {
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
					// if the first non-white 
					// space character is <, html, else text
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
	}
}


/**
 * length getter and setter
 */
function length () {
	return {
		/**
		 * retreive response length
		 * 
		 * @return {number}
		 */
		get: function get () {
			var length = this.header['content-length'];
		    var body   = this.body;

			if (length == null) {
				if (!body) {
					return 0;
				} else if (typeof body === 'string') {
					return Buffer.byteLength(body);
				} else if (Buffer.isBuffer(body)) {
					return body.length;
				} else if (isJSON(body)) {
					return Buffer.byteLength(JSON.stringify(body));
				}
			}

		    return ~~length;
		},
		/**
		 * assign response length
		 * 
		 * @param {} value [description]
		 */
		set: function get (value) {
			this.set('Content-Length', value);
		}
	}
}


/**
 * message getter and setter
 */
function message () {
	return {
		/**
		 * retreive response message
		 * 
		 * @return {string}
		 */
		get: function get () {
		    return this.res.statusMessage || statuses[this.status];
		},
		/**
		 * assign response message
		 * 
		 * @param {string} message
		 */
		set: function set (value) {
		    this.res.statusMessage = value;
		}
	}
}


/**
 * status getter and setter
 */
function status () {
	return {
		/**
		 * retreive response status
		 * 
		 * @return {number}
		 */
		get: function get () {
			return this.res.statusCode;
		},
		/**
		 * assign response status
		 * 
		 * @param {number} code
		 */
		set: function set (code) {
			this._explicit     = true;

		    this.res.statusCode    = code;
		    this.res.statusMessage = statuses[code];

		    if (this.body && statuses.empty[code]) {
		    	this.body = null;
		    }
		}

	}
}


/**
 * header getter
 */
function header () {
	return {
		/**
		 * retreive response header
		 * 
		 * @return {string}
		 */
		get: function get () {
			return this._headers || {};
		}
	}
}


/**
 * lastModified getter
 */
function lastModified () {
	return {
		/**
		 * get the Last-Modified date in Date form, if it exists
		 *
		 * @return {Date}
		 */
		get: function get () {
			var date = this.get('last-modified');

			if (date) {
				return new Date(date);
			}
		},
		/**
		 * set Last-Modified date using a string or a Date
		 *
		 * @param {string|Date} value
		 */
		set: function set (value) {
			var type = typeof value;

			// if string/number
			if (type === 'string' || type === 'number') {
				value = new Date(value);
			}

			this.set('Last-Modified', value.toUTCString());
		}		
	}
}


/**
 * socket getter
 */
function socket () {
	return {
		/**
		 * return the request socket
		 *
		 * @return {Connection}
		 */
		get: function get () {
			return this.req.socket;
		}
	}
}


/**
 * writable getter
 */
function writable () {
	return {
		/**
		 * check if the request is writable
		 *
		 * @return {boolean}
		 */
		get: function get () {
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
	}	
}


/**
 * headerSent getter
 */
function headerSent () {
	return {
		/**
		 * check if header has been written to the socket
		 *
		 * @return {boolean}
		 */
		get: function get () {
			return this.res.headersSent;
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


module.exports = Response;
