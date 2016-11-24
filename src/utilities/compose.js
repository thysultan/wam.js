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

		function resolve (end) {
			resolved = end ? length : resolved + 1;
				
			resolved === length ? callback(context) : dispatch();
		}

		function dispatch () {
			try {
				return middlewares[resolved].call(context, context, resolve);
			} catch (error) {
				return reject(error);
			}
		}

		dispatch();
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

