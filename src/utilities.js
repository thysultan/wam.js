'use strict';


/**
 * ---------------------------------------------------------------------------------
 * 
 * dependencies
 * 
 * ---------------------------------------------------------------------------------
 */


var path       = require('path');
var url        = require('url');
var status     = require('./store/status');
var mime       = require('./store/mime');

var extname    = path.extname;
var urlParse   = url.parse;
var pathRegExp = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/;


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
 * @return {Object}
 */
function Bootstrap () {
	return {
		compose: compose, 
		type: type, 
		respond: respond, 
		delegate: Delegate, 
		parse: parse, 
		typeis: typeis
	};
}


/**
 * ---------------------------------------------------------------------------------
 * 
 * methods
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * compose functions
 * 
 * @param  {function[]} middlewares
 * @param  {number}     length
 * @return {function}       
 */
function compose (middlewares, length) {
	return function (context) {
		var next, index = length;

		while (index--) {
			next = middlewares[index].call(context, context.request, context.response, next);
		}

		return context;
	}
}

/**
 * Create a full Content-Type header given a MIME type or extension.
 *
 * @param {string} value
 * @return {boolean|string}
 */
 function type (value) {
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

 		return mime[extension] || false;
 	} else {
 		type = value;
 	}

 	console.log(type, value);

 	if (!type) {
     	return false;
 	}

 	return type + '; charset=utf-8';
}


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
	if (status.empty[code]) {
		response.body = null;

		return res.end();
	}

	// status body
	if (body == null) {
		body = response.message || String(code);

		if (!res.headersSent) {
			response.type   = 'text';
			response.length = Buffer.byteLength(body);
		}

		return res.end(body);
	}

	// responses
	if (typeof body === 'string' || Buffer.isBuffer(body)) {
		// string/buffer
		return res.end(body);
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
 * delegation utility
 * 
 * @return {function}
 */
function Delegate (destination, target) {
	// support instantiation with or without new keyword
	if (!(this instanceof Delegate)) {
		return new Delegate(destination, target);
	}

	this.destination = destination;
	this.target = target;
}
Delegate.prototype = {
	// delegate method
	method: function method (name) {
		var target = this.target;

		this.destination[name] = function () {
			return this[target][name].apply(this[target], arguments);
		};

		return this;
	},
	// delegate getter
	getter: function getter (name) {
		var target = this.target;

		// Object.defineProperty doesn't work here, we only want to define a getter nothing more/less
		this.destination.__defineGetter__(name, function () {
  			return this[target][name];
		});

		return this;
	},
	// delegate setter
	setter: function setter (name) {
		var target = this.target;

		// Object.defineProperty doesn't work here, we only want to define a setter nothing more/less
		this.destination.__defineSetter__(name, function (value) {
  			return this[target][name] = value;
		});

		return this;
	},
	// delegate both getters and setters
	access: function access (name) {
		return this.getter(name).setter(name);
	}
};


/**
 * parse url, with cache and fast parse support
 * 
 * @param  {Object} req - request object
 * @return {Object}    
 */
function parse (req) {
	var url = req.url;

	if (url === undefined) {
  		return url;
	}

	var parsed = req._url;

	// if cache, return
	if (parsed != null && parsed._cache === url) {
  		return parsed;
	}

	// try fast path regexp i.e /page?id=123
	if (pathRegExp.exec(url)) {
		var pathname = simplePath[1],
			search   = simplePath[2];

		parsed = {
			path: url,
			href: url,
			pathname: pathname,
			search: search,
			query: search && search.substr(1),
			_url: url
		};
	} else {
		// default parse
		parsed = urlParse(url);
		// assign cache
		parsed._cache = url;
	}

	return req._url = parsed;
}


/**
 * check if is certain type 
 * 
 * @return {boolean}
 */
function typeis (types, value) {
	if (!types) {
		return value || false;
	}

	// text/html ---> html
	var type   = value,
		name   = type.split('/')[1],
		length = arguments.length;

	if (typeof types === 'string') {
		// single argument, this is also support generic types i.e is('image') will match any image type
		return ((name.indexOf('/') ? type : name).indexOf(types) > -1) || type === types;
	} else if (length > 0) {
		// single array argument
		for (var i = 0, length = types.length; i < length; i = i + 1) {
			var current = types[i];

			if ((name.indexOf(current) > -1) || type === current) {
				return true;
			}
		}
	} else {
		// more than one arguments
		for (var i = 0; i < length; i = i + 1) {
			var current = arguments[i];

			if ((name.indexOf(current) > -1) || type === current) {
				return true;
			}
		}
	}

	return false;
}


/**
 * ---------------------------------------------------------------------------------
 * 
 * exports
 * 
 * ---------------------------------------------------------------------------------
 */


module.exports = Bootstrap();

