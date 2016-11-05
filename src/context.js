'use strict';


/**
 * ---------------------------------------------------------------------------------
 * 
 * dependencies
 * 
 * ---------------------------------------------------------------------------------
 */


var utilities = require('./utilities');

var delegate  = utilities.delegate; 


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
 * @return {Context}
 */
function Bootstrap () {
	return Context;
}

/**
 * create context for middlewares
 * 
 * @return {Object}
 */
function Context () {
	var context = {
		app: null,
		req: null,
		res: null,
		request: null,
		response: null,
		set: null,
		get: null,
		is: null,
		state: {}
	};

	// response delegates
	delegate(context, 'response')
		.method('remove')
		.method('set')
		.access('status')
		.access('message')
		.access('body')
		.access('length')
		.access('type')
		.access('lastModified')
		.getter('headerSent')
		.getter('writable');

	// request delegates
	delegate(context, 'request')
		.method('get')
		.method('is')
		.access('method')
		.access('url')
		.getter('origin')
		.getter('href')
		.getter('header');

	return context;
}


/**
 * ---------------------------------------------------------------------------------
 * 
 * exports
 * 
 * ---------------------------------------------------------------------------------
 */

 
module.exports = Bootstrap();

