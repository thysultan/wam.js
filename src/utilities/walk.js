/**
 * -----------------------------------------------------------
 * 
 * walk & create list of all files directory, recursively
 * 
 * -----------------------------------------------------------
 */


'use strict';


var fs           = require('fs');
var path         = require('path');
var zlib         = require('zlib');
var compressible = require('./mimes').compressible;

var extname      = path.extname;
var hidden       = /(^|\/)\.[^\/\.]/g;


/**
 * walk & create list of all files directory, recursively
 * 
 * @param  {string} directory
 * @param  {Object} store
 * @return {Object}
 */
function walk (directory, store, start, cache, threshold, zip) {
	var files = fs.readdirSync(directory);

	// iterate through all files in directory, if a file is
	// a directory recursively walk the tree
	for (var i = 0, length = files.length; i < length; i++) {
		var filename = files[i];
		var filepath = path.join(directory, filename);
		var filestat = fs.statSync(filepath);
		var mtime    = filestat.mtime;
		var size     = filestat.size;

		// ignore hidden files i.e `.cache/.DS_Store`...
		if (!hidden.test(filename)) {
			if (fs.statSync(filepath).isDirectory()) {
				// directory, recursive walk
				store = walk(filepath, store, start, cache, threshold, zip);
			} else {
				var ext = extname(filepath).substr(1);
				var compress = compressible[ext];
				var gzip = null;
				
				if (compress && zip) {
					var gzippath = path.join(cache, filename+'.gz');

					// avoid gzipping small files
					if (size > threshold) {
						// set gzip path, read file, gzip file, write to .cache
						fs.writeFileSync(
							(gzip = gzippath), 
							zlib.gzipSync(fs.readFileSync(filepath))
						);

						size = fs.statSync(gzippath).size;
					} else {
						// delete previously gzipped file that is now below threshold
						if (fs.existsSync(gzippath)) {
							fs.unlinkSync(gzippath);
						}

						// register uncompressed version
						compress = false;
					}
				} else {
					compress = false;
				}

				store[filepath.substr(start)] = {
					name: filename.substr(0, filename.indexOf('.')),
					ext: ext,
					path: filepath,
					modified: mtime,
					gzip: gzip,
					gzipped: compress,
					size: size
				};
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


module.exports = walk;

