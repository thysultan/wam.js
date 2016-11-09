/**
 * -----------------------------------------------------------
 *  _      ______ _____ ___ 
 * | | /| / / __ `/ __ `__ \
 * | |/ |/ / /_/ / / / / / /
 * |__/|__/\__,_/_/ /_/ /_/ 
 *
 * Wam.js is a fast koa inspired middleware for node
 * https://github.com/thysultan/wam.js
 * 
 * @licence MIT
 * 
 * -----------------------------------------------------------
 */


'use strict';


var http      = require('http');
var fs        = require('fs');

var Context   = require('./context.js');
var Request   = require('./request.js');
var Response  = require('./response.js');
var utilities = require('./utilities/index.js');

var compose   = utilities.compose;
var respond   = utilities.respond;
var mimes     = utilities.mimes;
var statuses  = utilities.statuses;
var Static    = utilities.static;
var Compress  = utilities.compress;


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
Application.prototype = {
	use:      use, 
	listen:   listen, 
	callback: callback, 
	create:   create, 
	error:    error,
	static:   Static,
	compress: Compress,

	statuses: statuses,
	mimes:    mimes,
	http:     http,
	fs:       fs
};


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
	this.middlewares[this.length++] = !type ? route : router(route, type, callback);
	return this;
}


/**
 * define router middleware
 * 
 * @param  {string} route
 * @param  {(string|function)=} type
 * @param  {function}           middleware
 * @return {function}
 */
function router (route, type, middleware) {	
	type = type.toUpperCase();

	if (!middleware) {
		middleware = type, type = 'ALL';
	}

	var index   = 0,
		params  = [],
		regexp  = route instanceof RegExp ? route : /([:*])(\w+)|([\*])/g,
		pattern = new RegExp(
			route.replace(regexp, function () {
				var id = arguments[2];
				return id != null ? (params[index++] = id, '([^\/]+)') : '(?:.*)';
			}) + '$'
		);

	var reducer = (previousValue, currentValue, index) => {
		if (previousValue == null) {
			previousValue = {};
		}

		previousValue[params[index]] = currentValue;

		return previousValue;
	};

	return function (ctx, next) {		
		var location = ctx.request.url,
			method   = ctx.request.method,
			match    = location.match(pattern);

		if (match != null && (method === type || type === 'ALL')) {			
			var data = match.slice(1, match.length);

			ctx.params = data.reduce(reducer, null);

			middleware(ctx, next);
		} else {
			next();
		}
	}
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

		middleware(context, respond, error => context.error(error));
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
	var context  = new Context,
		request  = context.request  = new Request,
		response = context.response = new Response;

	// assign response and request reference to request and response respectively 
	request.response = response, response.request = request;
	
	context.app  = request.app = response.app = this;
	context.res  = request.res = response.res = res;
	context.req  = request.req = response.req = req;

	return response.ctx = request.ctx = context;
}


/**
 * default error handler
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
