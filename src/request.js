'use strict';


/**
 * ---------------------------------------------------------------------------------
 * 
 * dependencies
 * 
 * ---------------------------------------------------------------------------------
 */


var net       = require('net');
var url       = require('url');
var qs        = require('querystring');
var utilities = require('./utilities');

var stringify = url.format;
var parse     = utilities.parse;
var typeis    = utilities.typeis;


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
 * @return {Request}
 */
function Bootstrap () {
	return Request;
}


/**
 * response constructor
 * 
 * @param {Object} response
 */
function Request () {
 	return Object.defineProperties({ 		
 		req: null,
 		res: null,
 		app: null,
 		ctx: null,
 		response: null,

 		is: is,
 		get: get
 	}, {
 		header: {get: headerGetter },
 		url: { get: urlGetter, set: urlSetter },
 		origin: {get: originGetter},
 		href: {get: hrefGetter},
 		method: {get: methodGetter, set: methodSetter },
 		path: {get: pathGetter, set: pathSetter},
 		query: {get: queryGetter, set: querySetter },
 		querystring: {get: querystringGetter, set: querystringSetter },
 		search: { get: searchGetter, set: searchSetter },
 		socket: { get: socketGetter },
 		length: { get: lengthGetter },
 		protocol: { get: protocolGetter },
 		secure: { get: secureGetter },
 		type: { get: typeGetter },
 		host: { get: hostGetter }
	});
}


/**
 * ---------------------------------------------------------------------------------
 * 
 * methods
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * checks if incoming request contains "Content-Type" and any of the given mime types.
 * 
 * `null` if there is no request body, 
 * `false` if there is no content type, 
 * `else` the first `type` that matches
 *
 * @examples:
 *     // with Content-Type: text/html; charset=utf-8
 *     this.is('html');                       // => 'html'
 *     this.is('text/html');                  // => 'text/html'
 *     this.is('text/*', 'application/json'); // => 'text/html'
 *
 *     // when Content-Type is application/json
 *     this.is('json', 'urlencoded');         // => 'json'
 *     this.is('application/json');           // => 'application/json'
 *     this.is('html', 'application/*');      // => 'application/json'
 *
 *     this.is('html'); // => false
 *
 * @param  {string|string[]}   types...
 * @return {string|false|null}
 */
function is (types) {
	var type = this.get('accept').split(',')[0];

	if (!types) {
		return type || false;
	}

	return typeis(types, type);
}

/**
 * return request header (both `Referrer` and `Referer` are interchangeable)
 *
 * @examples:
 *     this.get('Content-Type'); // => "text/plain"
 *     this.get('content-type'); // => "text/plain"
 *     this.get('Something');    // => undefined
 *
 * @param  {string} name
 * @return {string}
 */
function get (name) {
	// normalize case
	name = name.toLowerCase();

	// referer/referrer
	if (name[0].charCodeAt(0) === 114 && name[4].charCodeAt(0) === 114) {
		return this.req.headers.referrer || this.req.headers.referer || '';
	} else {
		return this.req.headers[name] || '';
	}
}


/**
 * ---------------------------------------------------------------------------------
 * 
 * getters and setters
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * retrieve request header
 *
 * @return {Object}
 */
function headerGetter () {
	return this.req.headers;
}

/**
 * retrieve request URL
 *
 * @return {string}
 */
function urlGetter () {
	return this.req.url;
}

/**
 * assign request URL
 *
 * @param {string} value
 */
function urlSetter (value) {
	this.req.url = value;
}

/**
 * retrieve origin of URL
 *
 * @return {string}
 */
function originGetter () {
	return this.protocol + '' + '://' + this.host;
}

/**
 * retrieve full request URL
 *
 * @return {string}
 */
function hrefGetter () {
	var url = this.req.url;

	// ie, `GET http://example.com/foo`
	return /^https?:\/\//i.test(url) ? url : this.origin + url;
}

/**
 * get request method
 *
 * @return {string}
 */
function methodGetter () {
	return this.req.method;
}

/**
 * set request method
 *
 * @param {string} value
 */
function methodSetter (value) {
	this.req.method = value;
}

/**
 * get request pathname
 *
 * @return {string}
 */
function pathGetter () {
	return parse(this.req).pathname;
}

/**
 * assign pathname, retaining the query-string when present
 *
 * @param {string} value
 */
function pathSetter (value) {
	var url = parse(this.req);

	// pathname is already identical to value passed
	if (url.pathname === value) {
		return;
	}

	url.pathname = value;
	url.path = null;
	
	this.url = stringify(url);
}

/**
 * retrieve parsed query-string
 *
 * @return {Object}
 */
function queryGetter () {
	var querystring = this.querystring,
		querycache  = this._querycache = this._querycache || {};

	return querycache[querystring] || (querycache[querystring] = qs.parse(querystring));
}

/**
 * assign query-string
 *
 * @param {Object} value
 */
function querySetter (value) {
	this.querystring = qs.stringify(value);
}

/**
 * retrieve query string
 *
 * @return {string}
 */
function querystringGetter () {
	return !this.req ? '' : parse(this.req).query || '';
}

/**
 * assign querystring
 *
 * @param {string} str
 */
function querystringSetter (value) {
	var url = parse(this.req);

	// querystring is already identical to value passed
	if (url.search === ('?' + value)) {
		return;
	}

	url.search = value;
	url.path = null;

	this.url = stringify(url);
}

/**
 * retrieve the search string. Same as the querystring
 * except it includes the leading ?.
 *
 * @return {string}
 */
function searchGetter () {
	return !this.querystring ? '' : '?' + this.querystring;
}

/**
 * assign the search string. Same as
 * response.querystring= but included for ubiquity.
 *
 * @param {string} value
 */
function searchSetter (value) {
	this.querystring = value;
}

/**
 * retrieve the request socket
 *
 * @return {Connection}
 */
function socketGetter () {
	return this.req.socket;
}

/**
 * retrieve parsed Content-Length when present
 *
 * @return {number}
 */
function lengthGetter () {
	var length = this.get('Content-Length');

	return !length ? 0 : ~~length;
}

/**
 * retrieve the protocol string "http" or "https"
 *
 * @return {string}
 */
function protocolGetter () {
	return this.socket.encrypted ? 'https': 'http';
}

/**
 * short-hand for: this.protocol == 'https'
 *
 * @return {boolean}
 */
function secureGetter () {
	return this.protocol === 'https';
}

/**
 * retrieve the request mime type void of parameters such as "charset"
 *
 * @return {string}
 */
function typeGetter () {
	var type = this.get('Content-Type');

	return !type ? '' : type.split(';')[0];
}

/**
 * retrieve host
 *
 * @return {string} hostname:port
 */
function hostGetter () {
	var host = this.get('Host');
	
	return !host ? '' : host.split(/\s*,\s*/)[0];
}


/**
 * ---------------------------------------------------------------------------------
 * 
 * exports
 * 
 * ---------------------------------------------------------------------------------
 */


module.exports = Bootstrap();

