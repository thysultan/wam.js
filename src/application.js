/**
 * -----------------------------------------------------------
 * 
 * application
 * 
 * -----------------------------------------------------------
 */


'use strict';


var http       = require('http');
var fs         = require('fs');
var Context    = require('./context');
var Request    = require('./request');
var Response   = require('./response');
var Static     = require('./middlewares/static');
var Compress   = require('./middlewares/compress');
var Respond    = require('./middlewares/respond');
var Router     = require('./middlewares/router');
var Components = require('./middlewares/components');
var utilities  = require('./utilities');

var compose    = utilities.compose;
var mimes      = utilities.mimes;
var statuses   = utilities.statuses;


/**
 * -----------------------------------------------------------
 * 
 * constructors
 * 
 * -----------------------------------------------------------
 */


/**
 * application constructor
 *
 * @return {Application}
 */
function Application () {
	// support instantiation with or without new keyword
	if (!(this instanceof Application)) {
		return new Application;
	}

	this.env         = process.env.NODE_ENV || 'development';
	this.middlewares = [];
	this.length      = 0;
	this.errors      = null;
}

/**
 * Application prototype
 * 
 * @type {Object}
 */
Application.prototype = Object.create(null, {
	use:        { value: use },
	listen:     { value: listen },
	callback:   { value: callback },
	create:     { value: create },
	error:      { value: error },

	static:     { value: Static },
	compress:   { value: Compress },
	route:      { value: Router },
	components: { value: Components },

	statuses:   { value: statuses },
	mimes:      { value: mimes }
});


/**
 * -----------------------------------------------------------
 * 
 * methods
 * 
 * -----------------------------------------------------------
 */


/**
 * define middleware
 *
 * @param  {(string|function)}  middleware
 * @param  {(string|function)=} type
 * @param  {function=}          callback
 * @return {Application}        self
 */
function use (route, type, callback) {
	if (route) {		
		var middleware;

		if (!type) {
			middleware = route.length >= 2 ? route : function (ctx, next) {
				route(ctx);
				next();
			};
		} else {
			middleware = Router(route, type, callback);
		}

		if (typeof middleware === 'function') {
			this.middlewares[this.length++] = middleware;
		}
	}

	return this;
}


/**
 * shorthand for: http.createServer(app.callback()).listen(...)
 *
 * @param  {any}    ...
 * @return {Server}
 */
function listen () {
	var server = http.createServer(this.callback());

	return server.listen.apply(server, arguments);
}


/**
 * create callback for http.createServer
 * 
 * @return {function}
 */
function callback () {
	var middleware  = compose(this.middlewares, this.length),
		application = this;

	return function (req, res) {
		// default status
		res.statusCode = 404;

		var context = application.create(req, res);

		middleware(context, Respond, function (error) { 
			context.error(error);
		});
	};
}


/**
 * create new context
 * 
 * @param  {Object} req
 * @param  {Object} res
 * @return {Object}
 */
function create (req, res) {
	var context  = new Context;
	var request  = context.request  = new Request;
	var response = context.response = new Response;

	// assign response and request reference to request and response respectively 
	request.response = response, response.request = request;
	
	context.app  = request.app = response.app = this;
	context.res  = request.res = response.res = res;
	context.req  = request.req = response.req = req;

	return response.ctx = request.ctx = context;
}


/**
 * default error logger
 *
 * @param {Error} error
 */
function error (error) {
	console.error('\n', (error.stack || error.toString()).replace(/^/gm, '  '), '\n');
}


/**
 * -----------------------------------------------------------
 * 
 * exports
 * 
 * -----------------------------------------------------------
 */


module.exports = Application;


