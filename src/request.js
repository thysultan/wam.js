/**
 * -----------------------------------------------------------
 * 
 * request
 * 
 * -----------------------------------------------------------
 */


'use strict';


var net       = require('net');
var format    = require('url').format;
var extname   = require('path').extname;
var qs        = require('querystring');

var utilities = require('./utilities/index.js');

var parse     = utilities.parse;
var isType    = utilities.isType;


/**
 * -----------------------------------------------------------
 * 
 * constructors
 * 
 * -----------------------------------------------------------
 */


/**
 * request constructor
 * 
 * @param {Request}
 */
function Request () {
	this.req      = null;
	this.res      = null;
	this.app      = null;
	this.ctx      = null;
	this.response = null;
}

/**
 * Request prototype
 * 
 * @type {Object}
 */
Request.prototype = Object.defineProperties({
	is:               is,
	get:              get
}, {
 	// getters and setters
	header:           header(),
	url:              url(),
	method:           method(),
	path:             path(),
	query:            query(),
	querystring:      querystring(),
	search:           search(),
	origin:           origin(),
	href:             href(),
	ext:              ext(),
	socket:           socket(),
	length:           length(),
	protocol:         protocol(),
	secure:           secure(),
	type:             type(),
	host:             host(),
	ips:              ips()
});


/**
 * -----------------------------------------------------------
 * 
 * methods
 * 
 * -----------------------------------------------------------
 */


/**
 * checks if incoming request contains "Content-Type" 
 * and any of the given mime types.
 *
 * @param  {(string|string[])} types...
 * @return {(string|false)}
 */
function is (types) {
	var type = this.get('accept').split(',')[0];

	if (!types) {
		return type || false;
	}

	return isType(types, type);
}


/**
 * return request header 
 * (both `Referrer` and `Referer` are interchangeable)
 *
 * @examples: this.get('Content-Type'); // => "text/plain"
 *     		  this.get('content-type'); // => "text/plain"
 *
 * @param  {string} field
 * @return {string}
 */
function get (field) {
	// normalize case
	var name = field.toLowerCase();

	// referer/referrer
	if (name[0] === 'r' && name[4] === 'r') {
		return (
			this.req.headers.referrer || 
			this.req.headers.referer  || ''
		);
	} else {
		return this.req.headers[name] || '';
	}
}


/**
 * -----------------------------------------------------------
 * 
 * getters and setters
 * 
 * -----------------------------------------------------------
 */


/**
 * header getter
 */
function header () {
	return {
		/**
		 * retrieve request header
		 *
		 * @return {Object}
		 */
		get: function () {
			return this.req.headers;
		}
	}
}


/**
 * url getter and setter
 */
function url () {
	return {
		/**
		 * retrieve request URL
		 *
		 * @return {string}
		 */
		get: function () {
			return this.req.url
		},
		/**
		 * assign request URL
		 *
		 * @param {string} value
		 */
		set: function () {
			return this.req.url = value;
		}
	}
}


/**
 * origin getter
 */
function origin () {
	return {
		/**
		 * retrieve origin of URL
		 *
		 * @return {string}
		 */
		get: function () {
			return this.protocol + '' + '://' + this.host;
		}
	}
}


/**
 * href getter
 */
function href () {
	return {
		/**
		 * retrieve full request URL
		 *
		 * @return {string}
		 */
		get: function () {
			var url = this.req.url;

			// ie, `GET http://example.com/foo`
			return /^https?:\/\//i.test(url) ? url : this.origin + url;
		}
	}
}


/**
 * method getter and setter
 */
function method () {
	return {
		/**
		 * get request method
		 *
		 * @return {string}
		 */
		get: function () {
			return this.req.method;
		},
		/**
		 * set request method
		 *
		 * @param {string} value
		 */
		set: function (value) {
			this.req.method = value;
		}
	}
}


/**
 * path getter and setter
 */
function path () {
	return {
		/**
		 * get request pathname
		 *
		 * @return {string}
		 */
		get: function () {
			return parse(this.req).pathname;
		},
		/**
		 * assign pathname, retaining the query-string when present
		 *
		 * @param {string} value
		 */
		set: function (value) {
			var url = parse(this.req);

			// pathname is already identical to value passed
			if (url.pathname === value) {
				return;
			}

			url.pathname = value;
			url.path = null;
			
			this.url = format(url);
		}
	}
}


/**
 * ext getter
 */
function ext () {
	return {
		/**
		 * get request path extension
		 *
		 * @return {string}
		 */
		get: function () {
			return extname(parse(this.req).pathname).substr(1);
		}
	}
}


/**
 * query getter and setter
 */
function query () {
	return {
		/**
		 * retrieve parsed query-string
		 *
		 * @return {Object}
		 */
		get: function () {
			var querystring = this.querystring,
				querycache  = this._querycache = this._querycache || {};

			return (
				querycache[querystring] || 
				(querycache[querystring] = qs.parse(querystring))
			);
		},
		/**
		 * assign query-string
		 *
		 * @param {Object} value
		 */
		set: function (value) {
			this.querystring = qs.stringify(value);
		}
	}
}


/**
 * querystring getter and setter
 */
function querystring () {
	return {
		/**
		 * retrieve query string
		 *
		 * @return {string}
		 */
		get: function () {
			return !this.req ? '' : parse(this.req).query || '';
		},
		/**
		 * assign querystring
		 *
		 * @param {string} str
		 */
		set: function (value) {
			var url = parse(this.req);

			// querystring is already identical to value passed
			if (url.search === ('?' + value)) {
				return;
			}

			url.search = value;
			url.path = null;

			this.url = format(url);
		}
	}
}


/**
 * search getter and setter
 */
function search () {
	return {
		/**
		 * retrieve the search string. Same as the querystring
		 * except it includes the leading ?.
		 *
		 * @return {string}
		 */
		get: function searchGetter () {
			return !this.querystring ? '' : '?' + this.querystring;
		},
		/**
		 * assign the search string. Same as
		 * response.querystring= but included for ubiquity.
		 *
		 * @param {string} value
		 */
		set: function searchSetter (value) {
			this.querystring = value;
		}
	}
}


/**
 * socket getter
 */
function socket () {
	return {
		/**
		 * retrieve the request socket
		 *
		 * @return {Connection}
		 */
		get: function () {
			return this.req.socket;
		}
	}
}


/**
 * length getter
 */
function length () {
	return {
		/**
		 * retrieve parsed Content-Length when present
		 *
		 * @return {number}
		 */
		get: function () {
			var length = this.get('Content-Length');

			return !length ? 0 : ~~length;
		}
	}
}


/**
 * protocl getter
 */
function protocol () {
	return {
		/**
		 * retrieve the protocol string "http" or "https"
		 *
		 * @return {string}
		 */
		get: function () {
			return this.socket.encrypted ? 'https': 'http';
		}
	}
}


/**
 * secure getter
 */
function secure () {
	return {
		/**
		 * short-hand for: this.protocol == 'https'
		 *
		 * @return {boolean}
		 */
		get: function () {
			return this.protocol === 'https';
		}
	}
}


/**
 * type getter
 */
function type () {
	return {
		/**
		 * retrieve the request mime type 
		 * void of parameters such as "charset"
		 *
		 * @return {string}
		 */
		get: function () {
			var type = this.get('Content-Type');

			return !type ? '' : type.split(';')[0];
		}
	}
}


/**
 * host getter
 */
function host () {
	return {
		/**
		 * retrieve host
		 *
		 * @return {string} hostname:port
		 */
		get: function () {
			var host = this.get('Host');
			
			return !host ? '' : host.split(/\s*,\s*/)[0];
		}
	}
}


/**
 * ips getter
 */
function ips () {
	return  {
		/**
		 * parse "X-Forwarded-For" ip address list
		 *
		 * @return {any[]}
		 */
		get: function () {
	  		var value = this.get('X-Forwarded-For');

	  		return value ? value.split(/\s*,\s*/) : [];
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


module.exports = Request;

