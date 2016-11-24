/**
 * -----------------------------------------------------------
 * 
 * parser, parses urls
 * 
 * -----------------------------------------------------------
 */


'use strict';


var parse = require('url').parse;
var regex = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/;


/**
 * parse url, with cache and fast parse support
 * 
 * @param  {Object} req - request object
 * @return {Object}    
 */
function parser (req) {
	var url = req.url;

	if (url === undefined) {
  		return url;
	}

	var parsed = req._url;

	// if cache, return
	if (parsed != null && parsed._cache === url) {
  		return parsed;
	}

	var simple = regex.exec(url);

	// try fast path regexp i.e /page?id=123
	if (simple) {
		var pathname = simple[1];
		var search   = simple[2];

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
 * -----------------------------------------------------------
 * 
 * exports
 * 
 * -----------------------------------------------------------
 */


module.exports = parser;

