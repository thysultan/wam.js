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
	this.set      = null;
	this.get      = null;
	this.is       = null;
	this.state    = {};
}


/**
 * Context prototype
 * 
 * @type {Object}
 */
Context.prototype = {
	onerror: function onerror (error) {
		if (!(error instanceof Error)) {
			error = new Error(error);
		}

		// if response is yet to complete
		if (!this.headerSent || this.writable) {
	  		// force text/plain
	  		this.type = 'html';

	  		// ENOENT(no such file or directory) support
	  		if (error.code === 'ENOENT') {
	  			error.status = 404;
	  		}

	  		// default to 500
	  		if (typeof error.status !== 'number' || !statuses[error.status]) {
	  			error.status = 500;
	  		}

	  		// construct response
	  		var code = error.status;

			var message = (
				(this.app.errors && this.app.errors[code]) ||
				(error.expose && error.message)  || 
				('<h1>' + code + ' - ' + (this[code] || 'Something went wrong') + '</h1>')
			);

	  		this.status = error.status;
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
  .getter('ext')
  .getter('origin')
  .getter('href')
  .getter('protocol')
  .getter('host')
  .getter('hostname')
  .getter('header')
  .getter('secure');


/**
 * -----------------------------------------------------------
 * 
 * exports
 * 
 * -----------------------------------------------------------
 */

 
module.exports = Context;
