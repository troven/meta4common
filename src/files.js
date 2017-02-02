var debug = require("debug")("meta4:files");

var converts = require("./converter");

var self = module.exports = module.exports || {};

// =============================================================================
// framework packages

var fs = require('fs'); // file system
var _ = require('underscore'); // underscore
var paths = require('path'); // file paths
var mkdirp = require('mkdirp'); // recursive directories
var assert = require("assert");

// =============================================================================

_.extend(self, {
	FILE_ENCODING: "UTF-8",

	path: function (dir, file) {
		var filename = path.normalize(dir + "/" + file);
		// if (filename.indexOf(dir)!=0) throw new Error("File before root: "+filename);
		return filename;
	},

	root: function (scope, file) {
		assert(scope, "Missing scope");
		assert(scope.paths, "Missing scope paths");
		var dir = scope.paths.files || scope.files;
		// debug("PATHS: %j", scope.paths);
		assert(dir, "Missing root folder");
		var path = self.path(dir, file);
		// debug("ROOT: %s [%s] -> %s", dir, file, path);
		return path;
	},

	config: function (configFile, options) {
		assert(configFile, "Missing configFile");
		assert(options, "Missing existing config");
		if (!self.exists(configFile)) return options;
		var json = JSON.parse(fs.readFileSync(configFile, self.FILE_ENCODING));
		var paths = options.paths;
		options = _.extend(options, json);
		options.paths = _.extend(paths, options.paths);

		debug("configured: %s", configFile)
		return options;
	},

	load: function (file, options) {
		assert(file, "Missing file");
		assert(self.exists(file), "File not found: " + file);
		options = options || {};
		//        debug("load %s: %s", self.FILE_ENCODING, file);
		var raw = fs.readFileSync(file, self.FILE_ENCODING);
		return raw;
	},

	save: function (file, data) {
		assert(file, "Missing file");
		assert(data, "Missing data");
		fs.writeSync(file, data);
		return true;
	},

	parse: function (file, onFound) {
		assert(file, "Missing file");
		assert(file, "Missing file");
		var raw = self.load(file);
		return self.convert(file, raw, onFound);
	},

	convert: function (file, raw, onFound) {
		assert(file, "Missing file");
		var format = self.extension(file);
		assert(format, "Missing format");
		var converter = converts[format];
		// debug("convert: %s -> %s -> %s", file, format, converter);
		if (!converter) {
			onFound ? onFound(file, raw) : raw;
		} else {
			try {
				converter(raw, function (err, json) {
					assert(!err, format + " not valid: " + file + " --> ");
					onFound ? onFound(file, json) : json;
				})
			} catch (e) {
				console.log("Error in converting: %s -> %s", file, e);
				throw new Error(e+" in "+file);
			}
		}
	},

	mkdirs: function (path) {
		mkdirp.sync(path);
	},

	rmrf: function (path) {
		assert(path, "Missing path");
		debug("rm -rf %s", path);
		if (self.exists(path)) {
			if (self.isDirectory(path)) {
				fs.readdirSync(path).forEach(function (file, index) {
					var curPath = path + "/" + file;
					self.rmrf(curPath);
				});
				fs.rmdirSync(path);
			} else {
				fs.unlinkSync(path);
			}
		}
	},

	isDirectory: function (file) {
		try {
			var stat = fs.statSync(file);
			return stat ? stat.isDirectory() : false;
		} catch (e) {
			return false;
		}
	},

	isFile: function (file) {
		return !this.isDirectory(file);
	},

	extension: function (path) {
		var ix = path.lastIndexOf(".");
		if (ix < 0) return false;
		return path.substring(ix + 1).toLowerCase();
	},

	matches: function (path, filter) {
		assert(path, "Missing path");
		if (!filter) return true;
		return path.indexOf(filter) >= 0;
	},

	find: function (home, accept, _files) {

		var recurse = function (dir, files) {
			var found = fs.readdirSync(dir)

			found.forEach(function (file) {
				var path = paths.normalize(dir + "/" + file);
				if (self.isDirectory(path)) {
					recurse(path + "/", files);
				} else {
					if (!accept || accept(path)) {
						self.parse(path, function (file, data) {
							files[file] = data;
						});
					}
				}
			})
			return files;
		}

		return recurse(home, _files || {})
	},

	follow: function (path, onFound, allDone) {
		if (!self.exists(path)) return;

		var found = fs.readdirSync(path);
		_.each(found, function (dir) {
			dir = self.path(path, dir);
			if (self.isFolder(dir)) {
				self.follow(dir, onFound);
			} else onFound(dir);
		})
		allDone && allDone();
	},

	exists: function (file) {
		try {
			var stat = fs.statSync(file);
			return stat ? true : false;
		} catch (e) {
			return false;
		}
	},

	size: function (file) {
		try {
			var stat = fs.statSync(file);
			return stat ? stat.size : -1;
		} catch (e) {
			return -1;
		}
	}
});
