/**
 * -----------------------------------------------------------
 * 
 * statuses, map of http statuses
 * 
 * -----------------------------------------------------------
 */


'use strict';


module.exports = {
	// status codes
	200: 'OK',
	300: 'Multiple Choices',
	301: 'Moved Permanently',
	302: 'Found',
	304: 'Not Modified',
	307: 'Temporary Redirect',
	400: 'Bad Request',
	401: 'Unauthorized',
	403: 'Forbidden',
	404: 'Not Found',
	410: 'Gone',
	500: 'Internal Server Error',
	501: 'Not Implemented',
	503: 'Service Unavailable',
	550: 'Permission denied',

	// status codes for empty body
	empty: {
		204: true,
		205: true,
		304: true
	},

	// status codes for redirects
	redirect: {
		300: true,
		301: true,
		302: true,
		303: true,
		305: true,
		307: true,
		308: true
	},

	// status codes for retry the request
	retry: {
		502: true,
		503: true,
		504: true
	}
};

