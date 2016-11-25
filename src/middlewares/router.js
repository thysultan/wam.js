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

	if (middleware === void 0) {
		middleware = type, method = 'ALL';
	} else {
		method = type.toUpperCase();
	}

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

	return function (ctx, next) {		
		var rlocation = ctx.request.url;
		var rmethod   = ctx.request.method;
		var match     = rlocation.match(pattern);

		if (match != null && (rmethod === method || method === 'ALL')) {			
			var data = match.slice(1, match.length);

			ctx.params = data.reduce(reducer, null);

			middleware(ctx, next);
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

