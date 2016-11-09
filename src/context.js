/**
 * -----------------------------------------------------------
 * 
 * context, create new context
 * 
 * -----------------------------------------------------------
 */


'use strict';


var utilities = require('./utilities/index.js')

var delegate = utilities.delegate;
var statuses = utilities.statuses;


/**
 * -----------------------------------------------------------
 * 
 * constructors
 * 
 * -----------------------------------------------------------
 */


/**
 * create context for middlewares
 * 
 * @return {Context}
 */
function Context () {
	this.app      = null;
	this.req      = null;
	this.request  = null;
	this.response = null;
	this.params   = null;
	this.state    = {};
}


/**
 * Context prototype
 * 
 * @type {Object}
 */
Context.prototype = {
	error: function error (error) {
		if (!(error instanceof Error)) {
			error = new Error(error);
		}

		// logger
		this.app.error(error);

		// if response is yet to complete
		if (!this.headerSent || this.writable) {
	  		// force text/html
	  		this.type = 'html';

	  		// default to 500
			var code    = 500,
				message = code + ' - ' + (statuses[code] || 'Something went wrong');

			message     = '<h1>' + message + '</h1>';
	  		this.status = code;
	  		this.length = Buffer.byteLength(message);

	  		this.res.end(message);
		}
	}
};


// response delegates
delegate(Context.prototype, 'response')
	.method('remove')
	.method('set')
	.access('status')
	.access('message')
	.access('body')
	.access('length')
	.access('type')
	.access('lastModified')
	.access('etag')
	.getter('headerSent')
	.getter('writable');


// request delegates
delegate(Context.prototype, 'request')
	.method('accepts')
	.method('get')
	.method('is')
	.access('querystring')
	.access('socket')
	.access('search')
	.access('method')
	.access('query')
	.access('path')
	.access('url')
	.getter('origin')
	.getter('href')
	.getter('protocol')
	.getter('host')
	.getter('hostname')
	.getter('header')
	.getter('secure')
	.getter('ext')
	.getter('ips');


/**
 * -----------------------------------------------------------
 * 
 * exports
 * 
 * -----------------------------------------------------------
 */

 
module.exports = Context;
