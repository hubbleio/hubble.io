/*
 * Content!
 */

var fs = require('fs'),
    async = require('async'),
    Plates = require('plates');

var Templates = function(conf, github, callback) {

  var that = this;

  //
  // each asset is represented by a path and file, and has three associated members.
  // @member raw {String} A string version of the untouched file.
  // @member compiled {String} A string version of of the file after transformation.
  // @member compose {Function} A function that will merge the data into the string.
  //
  this.assets = {
    '/listing.html': {
      primary: false,
      raw: fs.readFileSync('./public/templates/listing.html').toString(),
      compiled: '',
      compose: function(cb) {

        var asset = this;
        var html = asset.raw;

        github.repos(function(response) {

          response = JSON.parse(response);

          response.forEach(function(repo, index) {

            var data = {
              "name": repo.name,
              "description": repo.description,
              "fork": repo.forks,
              "like": repo.watchers,
              "created": repo.created_at,
              "updated": repo.updated_at
            };

            var options = { 
              "name": "class",
              "description": "class",
              "fork": "class",
              "like": "class",
              "created": "class",
              "updated": "class"
            };

            asset.compiled += Plates.bind(html, data, options);

          });

          return cb(asset.compiled);
          
        });

      }
    },
    '/index.html': {
      primary: true,
      raw: fs.readFileSync('./public/templates/index.html').toString(),
      compiled: '',
      compose: function(cb) {

        var asset = this;
        var html = this.raw;

        //
        // lets pull some things out of the main configuration
        // and use them to populate the index.html page.
        //

        that.assets['/listing.html'].compose(function(listing) {
        
          var data = {
            "orgname": conf['orgname'],
            "breadcrumbs": conf['tagline'],
            "main": listing
          };

          asset.compiled = Plates.bind(html, data);
          if (cb) {
            return cb(asset.compiled);
          }
          else {
            return asset.compiled;
          }
          

        });

      }
    }
  };

  //
  // lets compile everything once when we start the server.
  //
  async.forEach(
    Object.keys(this.assets),
    function(val, index) {
      var asset = that.assets[val];
      if (asset.primary) {
        asset.compose();
      }
    },
    function(err) {
      if (err) {
        throw new Error(err);
      }
      else {
        callback(that.assets);
      }
    }
  );

};

module.exports = Templates;

