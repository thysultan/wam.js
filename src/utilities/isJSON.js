/**
 * -----------------------------------------------------------
 * 
 * isJSON, check if response body is json
 * 
 * -----------------------------------------------------------
 */


'use strict';


/**
 * check if body is json
 * 
 * @param {(string|Buffer|Stream)} body
 */
function isJSON (body) {
	return !(
		!body || 
		typeof body === 'string' || 
		typeof body.pipe === 'function' || 
		Buffer.isBuffer(body)
	);
}

/**
 * -----------------------------------------------------------
 * 
 * exports
 * 
 * -----------------------------------------------------------
 */

module.exports = isJSON;
