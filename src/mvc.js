var self = module.exports

// =============================================================================
// framework packages

var _          = require('underscore');     // functional coding

// meta4 packages

var files      = require('./files');     	// files helper

// =============================================================================

self.accepts = {
	json: function(file, data) { return file.indexOf(".json")>0 },
	html: function(file, data) { return file.indexOf(".html")>0 },
	ecma: function(file, data) { return file.indexOf(".js")>0 }
}

self.reload = {

	all: function(feature) {
		var cache = {}
		_.each(feature.paths, function(fpath, key) {
			if ( _.isFunction(self.reload[key]) ) {
				// refresh uses closure to encapsulate feature/path state 
				files.mkdirs(fpath)
				cache[key] = self.reload[key](fpath, feature)
				cache[key].refresh = function() {
					cache[key] = self.reload[key](fpath, feature)
				}
			}
		})
	    cache.now = new Date().getTime()

		// refresh uses closure to encapsulate feature 
		cache.refresh = function() {
			self.reload.all(feature)
		}

		return cache
	},

	models: function(modelsDir, feature) {
		var found  = files.find(modelsDir, self.accepts.json )
		var models = {}

		_.each( found, function(data, file) {
			if (!data) return
			try {
				var model = JSON.parse(data)
			} catch(e) {
				console.log("Corrupt JSON:", file)
			}

			// only designated client models
			if (model.isClient) {
				model.id = model.id || path.basename(file, ".json")
				models[model.id] = model
			}

			model.url = model.url || feature.basePath+"/"+model.id
//        console.log("\tmodel: ", model.id, "@", model.url)
		})
		return models
	},
    views: function(viewsDir) {
        var found  = files.find(viewsDir, self.accepts.json )
        var views = {}
        _.each( found, function(data, file) {
            try {
                var view = JSON.parse(data)
                view.id = view.id || path.basename(path.normalize(file), ".json")
                views[view.id] = view
            } catch(e) {
                console.error("Error:", file, e)
            }
        })
        return views
    },

    templates: function(templatesDir, feature) {
	    var found  = files.find(templatesDir, self.accepts.html )
	    var templates = {}

	    // add templates to recipe
	    var assetKey = "templates"
	    _.each( found, function(data, file) {
		    var id = file.substring(feature.paths[assetKey].length+1)
//console.log("UX: template", id)

		    // strip repetitive whitespace
		    templates[assetKey+":"+id] = (""+data).replace(/\s+/g, ' ');
	    })
	    return templates;
    },

    scripts: function(scriptsDir, feature) {
	    var found  = files.find(scriptsDir, self.accepts.ecma )
		var scripts = {}

	    // add JS scripts to recipe
	    var assetKey = "scripts"
	    _.each( found, function(data, file) {
		    var id = file.substring(feature.paths[assetKey].length+1)
//console.log("UX: script", id)
		    scripts[assetKey+":"+id] = ""+data
	    })
	    return scripts
    }
}
