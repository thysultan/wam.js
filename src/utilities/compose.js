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
	return function (context, respond, reject) {
		var index = 0;

		// if `control` is 0/1 the middleware chain will end
		// in addition to ending if `control` is 1
		// the normal `respond` middlware will get by-passed
		function resolve (control) {
			if (control !== void 0) {
				complete(context, respond, control);
			} else {
				if (++index === length) {
					complete(context, respond, 2);
				} else {
					dispatch(context, middlewares, index, resolve, reject);
				}
			}

			return resolve;
		}

		dispatch(context, middlewares, index, resolve, reject);
	}
}


/**
 * complete the middleware chain
 *
 * @param  {Object}              context
 * @param  {function}            respond
 * @param  {(boolean|undefined)} control
 */
function complete (context, respond, control) {
	respond(context, control);
}


/**
 * dispatch
 * 
 * @return {void}
 */
function dispatch (context, middlewares, index, resolve, reject) {
	try {
		middlewares[index].call(context, context, resolve);
	} catch (err) {
		reject(err);
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

