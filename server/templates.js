/*
 *
 * templates.js
 * merges the content from github into the html templates 
 * and creates a cache for it in memory if one does not exist.
 *
 */

var fs = require('fs'),
    async = require('async'),
    marked = require('marked'),
    Plates = require('plates');

var Templates = function(conf, github, callback) {

  var that = this;

  //
  // each asset is represented by a filename, and has three associated members.
  // @member raw {String} A string version of the untouched file.
  // @member compiled {Variant} A container for the result of the composition.
  // @member compose {Function} A function that will merge the data into the string.
  //
  this.assets = {};

  this.assets['listing.html'] = {
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
            github.conf(repo.name, function(cfg) {

              try {
                body = JSON.parse(body)
              }
              catch(ex) {
                body = { name: "[no package.json or `name` member in package.json]" };
              }

              var data = {

                //
                // we use the name from the package since it
                // isnt restricted as far as appearance goes.
                //
                "title": cfg.title,

                //
                // the rest of the details are simple.
                //
                "description": cfg.description,
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
  };

  this.assets['index.html'] = {
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
  };
  
  this.assets['content.html'] = {
    primary: true,
    raw: fs.readFileSync('./public/templates/content.html').toString(),
    compiled: {},
    compose: function(reponame, cb) {

      var asset = this;
      var html = this.raw;
      var err = null;

      //
      // in the case where there is a post recieve hook, this function will
      // be called with a specific reponame and a callback, but in the launch
      // case, there will be no specific repo name provided. In that case we
      // want to iterate over all the repos and generate all the content.
      //

      if (reponame) {
        
        github.repo(reponame, function(repo) {
          github.conf(reponame, function(cfg) {
            github.content(reponame, function(content) {

              var data = {
                "orgname": conf['orgname'],
                "breadcrumbs": cfg.title,
                "main": marked(content)
              };

              asset.compiled[reponame] = Plates.bind(html, data);

              if (cb) {
                return cb(err, asset.compiled[reponame]);
              }
              return asset.compiled;

            });
          });
        });

      }
      else {

        github.repos(function(response) {

          async.forEach(
            response,
            function(repo, next) {

              github.conf(reponame, function(cfg) {
                github.content(repo.name, function(content) {

                  var data = {
                    "orgname": conf['orgname'],
                    "breadcrumbs": cfg.title,
                    "main": marked(content)
                  };

                  asset.compiled[repo.name] = Plates.bind(html, data);
                  next();
                });
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

