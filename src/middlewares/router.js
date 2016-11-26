/**
 * -----------------------------------------------------------
 * 
 * router, middleware for defining routes
 * 
 * -----------------------------------------------------------
 */


'use strict';


/**
 * -----------------------------------------------------------
 * 
 * constructors
 * 
 * -----------------------------------------------------------
 */


/**
 * define router middleware
 * 
 * @param  {string} route
 * @param  {(string|function)=} type
 * @param  {function}           middleware
 * @return {function}
 */
function Router (route, type, middleware) {
	var method;
	var isarray = false;

	if (middleware === void 0) {
		middleware = type, method = 'ALL';
	} else {
		if (typeof type === 'string') {
			method = type.toUpperCase();
		} else {
			isarray = true;
			method = type.map(function (str) { return str.toUpperCase(); });
		}
	}

	// if the function does not use next() we can auto next() it
	var auto = middleware.length < 2;
	
	var index   = 0;
	var params  = [];
	var regexp  = route instanceof RegExp ? route : /([:*])(\w+)|([\*])/g;
	var pattern = new RegExp(
		route.replace(regexp, function () {
			var id = arguments[2];
			return id != null ? (params[index++] = id, '([^\/]+)') : '(?:.*)';
		}) + '$'
	);

	function reducer (previousValue, currentValue, index) {
		if (previousValue == null) {
			previousValue = {};
		}

		previousValue[params[index]] = currentValue;

		return previousValue;
	};

	function is (_method) {
		if (isarray) {
			return method.indexOf(_method) > -1;
		} else {
			return _method === method || method === 'ALL';
		}
	}

	return function (context, next) {		
		var _location = context.request.url;
		var _method   = context.request.method;
		var match     = _location.match(pattern);

		if (match != null && is(_method)) {	
			var data = match.slice(1, match.length);

			context.params = data.reduce(reducer, null);

			middleware(context, next);

			// auto proceed to next middlware
			if (auto) { next(); }
		} else {
			next();
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


module.exports = Router;

