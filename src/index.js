var assert = require("assert");

var self = module.exports;

self.files = require("./files");
self.mixins = require("./mixins");
self.mvc  = require("./packaging");
self.converter = require("./converter");

assert (self.files, "Missing {{files}} binding");
assert (self.files.find, "Missing {{files.find}} function");


assert (self.mixins, "Missing {{mixins}} binding");
assert (self.mixins.at, "Missing {{mixins.at}} function");

