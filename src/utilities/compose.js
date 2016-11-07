/**
 * -----------------------------------------------------------
 * 
 * compose, composes middlewares
 * 
 * -----------------------------------------------------------
 */


'use strict';


/**
 * compose functions
 * 
 * @param  {function[]} middlewares
 * @param  {number}     length
 * @return {function}       
 */
function compose (middlewares, length) {
	return function (context, callback, reject) {
		var resolved = 0;

		// resolve middlware
		function resolve () {
			resolved++;

			if (resolved === length) {
				callback(context);
			}
		}

		// rush through all middlewares sync
		for (var i = 0; i < length; i++) {
			call(context, resolve, reject, middlewares[i]);
		}
	}
}


/**
 * call middlware
 * 
 * @param  {function} middlware
 * @param  {function} resolve
 * @param  {function} reject
 * @param  {Object}   context
 */
function call (context, resolve, reject, middlware) {
	try {
		middleware.call(context, context, resolve);
	} catch (error) {
		reject(error);
	}
}



/**
 * -----------------------------------------------------------
 * 
 * exports
 * 
 * -----------------------------------------------------------
 */


module.exports = compose;
