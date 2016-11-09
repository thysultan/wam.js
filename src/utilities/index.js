/**
 * -----------------------------------------------------------
 * 
 * utilities, exports
 * 
 * -----------------------------------------------------------
 */


'use strict';


var compose  = require('./compose.js');
var getType  = require('./getType.js');
var respond  = require('./respond.js');
var delegate = require('./delegate.js');
var parse    = require('./parse.js');
var isType   = require('./isType.js');
var isJSON   = require('./isJSON.js');
var statuses = require('./statuses.js');
var mimes    = require('./mimes.js');
var Static   = require('./static.js');
var Compress = require('./compress.js');


/**
 * -----------------------------------------------------------
 * 
 * exports
 * 
 * -----------------------------------------------------------
 */


module.exports = {
	compose:  compose, 
	getType:  getType, 
	respond:  respond, 
	delegate: delegate, 
	parse:    parse, 
	isType:   isType,
	isJSON:   isJSON,
	statuses: statuses,
	mimes:    mimes,
	static:   Static,
	compress: Compress
};