var assert = require("assert");

var self = module.exports;

self.files = require("./files");
assert (self.files, "Missing {{files}} binding");
assert (self.files.find, "Missing {{files.find}} function");

self.mixins = require("./mixins");
assert (self.mixins, "Missing {{mixins}} binding");
assert (self.mixins.at, "Missing {{mixins.at}} function");

self.mvc  = require("./packaging");
