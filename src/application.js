'use strict';


/**
 * ---------------------------------------------------------------------------------
 * 
 * dependencies
 * 
 * ---------------------------------------------------------------------------------
 */


var http      = require('http');
var Context   = require('./context');
var Request   = require('./request');
var Response  = require('./response');
var utilities = require('./utilities');

var compose   = utilities.compose;
var respond   = utilities.respond;
var mimes     = utilities.mimes;
var statuses  = utilities.statuses;


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
 * @return {Application}
 */
function Bootstrap () {
	function Application () {
		// support instantiation with or without new keyword
		if (!(this instanceof Application)) {
			return new Application;
		}

		this.env         = process.env.NODE_ENV || 'development';
		this.middlewares = [];
		this.length      = 0;
		this.context     = Context();
		this.request     = Request();
		this.response    = Response();
	}

	Application.prototype = {
		statuses: statuses,
		mimes:    mimes,
		use:      use, 
		listen:   listen, 
		callback: callback, 
		create:   create, 
		http:     http
	};

	return Application;
}


/**
 * ---------------------------------------------------------------------------------
 * 
 * methods
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * define middleware
 *
 * @param  {function}    middleware
 * @return {Application} self
 */
function use (middleware) {
	return this.middlewares[this.length++] = middleware, this;
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
	var middleware = compose(this.middlewares, this.length),
		self = this;

	return function (req, res) {
		res.statusCode = 404;

		var context = self.create(req, res);

		middleware(context);
		respond(context);
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
	var context  = Object.create(this.context),
		request  = context.request  = Object.create(this.request),
		response = context.response = Object.create(this.response);
	
	request.response = response, response.request = request;

	context.app  = request.app = response.app = this;
	context.res  = request.res = response.res = res;
	context.req  = request.req = response.req = req;

	return response.ctx = request.ctx = context;
}


/**
 * ---------------------------------------------------------------------------------
 * 
 * exports
 * 
 * ---------------------------------------------------------------------------------
 */


module.exports = Bootstrap();

