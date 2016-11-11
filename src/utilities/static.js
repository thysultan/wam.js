/**
 * -----------------------------------------------------------
 * 
 * static, middleware for static file generator
 * 
 * -----------------------------------------------------------
 */


'use strict';


var fs       = require('fs');
var path     = require('path');
var mimes    = require('./mimes');

var regexp   = /(^|\/)\.[^\/\.]/g;


/**
 * static, middleware
 *
 * @param  {string}          base
 * @param  {function|string} callback
 * @return {function}
 */
function Static (base, callback) {
	var directory = path.normalize(base),
		start     = directory.length,
		stats     = fs.statSync(directory),
		modified  = stats.mtime,
		list      = List(directory, {}, start),
		handle    = typeof callback === 'function';

	// return middleware
	return function (context, next) {
		var pathname,
			uri      = context.req.url,
			mtime    = fs.statSync(directory).mtime;

		// if directory modified build new list
		if (mtime > modified) {
			modified = mtime;
			list     = List(directory, {}, start);
		}

		// if file exits
		if (pathname = list[uri]) {
			context.response.type = context.request.ext;

			// read file from file system
		    fs.readFile(pathname, (error, result) => {
		    	error ? context.error(error) : context.response.body = result;
		    	next(true);
		    });
		} else {
			if (handle) {
				context.response.body = callback();
				next(true);
			} else {
				mimes[context.request.ext] ? next(true) : next();
			}
		}
	}
}


/**
 * create list of all files directory, recursively
 * 
 * @param  {string} directory
 * @param  {Object} store
 * @return {Object}
 */
function List (directory, store, start) {
	var files = fs.readdirSync(directory);

	for (var i = 0, length = files.length; i < length; i++) {
		var filename = files[i];

		if (!regexp.test(filename)) {
			var filepath = path.join(directory, filename);

			if (fs.statSync(filepath).isDirectory()) {
				store = List(filepath, store, start);
			} else {
				store[filepath.substr(start)] = filepath;
			}
		}
	}

	return store;
}


/**
 * -----------------------------------------------------------
 * 
 * exports
 * 
 * -----------------------------------------------------------
 */


module.exports = Static;