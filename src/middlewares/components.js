/**
 * -----------------------------------------------------------
 * 
 * components, create a component based architecture
 * 
 * -----------------------------------------------------------
 */


'use strict';


var fs        = require('fs');
var path      = require('path');
var utilities = require('../utilities');

var extname   = path.extname;
var walk      = utilities.walk;


/**
 * -----------------------------------------------------------
 * 
 * constructors
 * 
 * -----------------------------------------------------------
 */


/**
 * use components constructor
 * 
 * @param {(string|object)} views
 * @param {any}             dependency
 */
function Components (views, dependency) {
	var data = typeof dependency === 'string' ? require(dependency) : dependency;

	if (typeof views === 'object') {
		register(this, format(views), data || {});
	} else {
		var directory = path.resolve(views);

		register(this, walk(directory, Object.create(null), '.cache', 1024, false), data);
	}
}


/**
 * -----------------------------------------------------------
 * 
 * methods
 * 
 * -----------------------------------------------------------
 */


/**
 * register routes
 * 
 * @param  {Application} app
 * @param  {Object}      files
 * @param  {any=}        data
 */
function register (app, files, data) {
	for (var filepath in files) {
		var name = files[filepath].name;
		var route = '/' + (name === 'index' ? '' : name);

		var component = require(filepath).call(app, data);

		app.use(route, component);
	}
}


/**
 * format views
 * 
 * @param  {Object} views
 * @return {Object}
 */
function format (views) {
	var output = Object.create(null);

	for (var view in views) {
		output[path.resolve(view)] = { name: views[view] };
	}

	return output;
}



/**
 * -----------------------------------------------------------
 * 
 * exports
 * 
 * -----------------------------------------------------------
 */


module.exports = Components;

