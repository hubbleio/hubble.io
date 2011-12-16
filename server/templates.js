/*
 * Content!
 */

var fs = require('fs'),
    async = require('async'),
    Plates = require('plates');

var Templates = function(conf, github, callback) {

  var that = this;

  //
  // each asset is represented by a filename, and has three associated members.
  // @member raw {String} A string version of the untouched file.
  // @member compiled {Variant} A container for the result of the composition.
  // @member compose {Function} A function that will merge the data into the string.
  //
  this.assets = {
    'listing.html': {
      primary: false,
      raw: fs.readFileSync('./public/templates/listing.html').toString(),
      compiled: '',
      compose: function(cb) {

        var asset = this;
        var html = asset.raw;
        var err = null;

        //
        // get all the repos for the specified org and iterate over them
        // in order to build some markup that represents them to the user.
        //
        github.repos(function(response) {

          async.forEach(
            response,
            function(repo, next) {

              //
              // also find the packages in each repo and explore them
              // in order to create the categories.
              //
              github.package(repo.name, function(package) {

                var data = {

                  //
                  // we use the name from the package since it
                  // isnt restricted as far as appearance goes.
                  //
                  "name": package.name,

                  //
                  // the rest of the details are simple.
                  //
                  "description": repo.description,
                  "fork": repo.forks,
                  "like": repo.watchers,
                  "created": repo.created_at,
                  "updated": repo.updated_at
                };

                //
                // map our data to the html
                //
                var options = { 
                  "name": "class",
                  "description": "class",
                  "fork": "class",
                  "like": "class",
                  "created": "class",
                  "updated": "class"
                };

                asset.compiled += Plates.bind(html, data, options);

                next();
              });
              
            },
            function(err) {

              if (err) {
                throw new Error(err);
              }
              
              return cb(err, asset.compiled);
            }
          );

        });

      }
    },
    'index.html': {
      primary: true,
      raw: fs.readFileSync('./public/templates/index.html').toString(),
      compiled: '',
      compose: function(cb) {

        var asset = this;
        var html = this.raw;
        var err = null;

        //
        // lets pull some things out of the main configuration
        // and use them to populate the index.html page.
        //

        that.assets['listing.html'].compose(function(err, listing) {
          
          var data = {
            "orgname": conf['orgname'],
            "breadcrumbs": conf['tagline'],
            "main": listing
          };

          asset.compiled = Plates.bind(html, data);

          if (cb) {
            return cb(err, asset.compiled);
          }
          return asset.compiled;

        });

      }
    }
  };

  //
  // lets compile everything once when we start the server.
  // if the postrecieve hook gets something sent to it, we'll
  // call individual code from above for that specific repo.
  //
  async.forEach(
    Object.keys(this.assets),
    function(key, next) {
      var asset = that.assets[key];
      if (asset.primary) {
        asset.compose();
      }
      next();
    },
    function(err) {
      if (err) {
        throw new Error(err);
      }
      return callback(that.assets);
    }
  );

};

module.exports = Templates;

