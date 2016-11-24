/**
 * -----------------------------------------------------------
 * 
 * isType - check mime type
 * 
 * -----------------------------------------------------------
 */


'use strict';


/**
 * check if is certain type 
 * 
 * @return {boolean}
 */
function isType (types, value) {
	if (!types) {
		return value || false;
	}

	// text/html ---> html
	var type   = value;
	var name   = type.split('/')[1];
	var length = arguments.length;

	if (typeof types === 'string') {
		// single argument, also support generic types 
		// i.e is('image') will match any image type
		return (
			((name.indexOf('/') ? type : name).indexOf(types) > -1) || 
			type === types
		);
	} else if (length > 0) {
		// single array argument
		for (var i = 0, length = types.length; i < length; i++) {
			var current = types[i];

			if ((name.indexOf(current) > -1) || type === current) {
				return true;
			}
		}
	} else {
		// more than one arguments
		for (var i = 0; i < length; i++) {
			var current = arguments[i];

			if ((name.indexOf(current) > -1) || type === current) {
				return true;
			}
		}
	}

	return false;
}


/**
 * -----------------------------------------------------------
 * 
 * exports
 * 
 * -----------------------------------------------------------
 */


module.exports = isType;

