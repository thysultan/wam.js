/**
 * -----------------------------------------------------------
 * 
 * utilities, exports
 * 
 * -----------------------------------------------------------
 */


'use strict';


var compose  = require('./compose');
var getType  = require('./getType');
var delegate = require('./delegate');
var parse    = require('./parse');
var isType   = require('./isType');
var isJSON   = require('./isJSON');
var statuses = require('./statuses');
var mimes    = require('./mimes');
var walk     = require('./walk');


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
	delegate: delegate, 
	parse:    parse, 
	isType:   isType,
	isJSON:   isJSON,
	statuses: statuses,
	mimes:    mimes,
	walk:     walk
};

