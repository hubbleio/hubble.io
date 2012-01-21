
var fs = require('fs');
var assets = module.exports;

assets['articles.html'] = {
  primary: false,
  raw: fs.readFileSync('./public/templates/listing.html').toString(),
  compiled: '',
  compose: function(callback) {

    var asset = this;
    var html = asset.raw;
    var err = null;

    //
    // get all the repos for the specified org and iterate over them
    // in order to build some markup that represents them to the user.
    //
    asset.cache.forEach(function(repo) {
      
      var data = {
        "description": cfg.description,
        "fork": repo.forks,
        "like": repo.watchers,
        "created": repo.created_at,
        "updated": repo.updated_at,
        "name": '/' + repo.name,
        "title": cfg.title
      };

      //
      // map our data to the html
      //
      var m = new Plates.Map();
      
      m.class('description').to('description');
      m.class('fork').to('fork');
      m.class('like').to('like');
      m.class('created').to('created');
      m.class('updated').to('updated');
      m.class('name').to('name').as('href');
      m.class('title').to('class');

      asset.compiled += Plates.bind(html, data, m);

    });

    callback();

  }
};

// assets['index.html'] = {
//   primary: true,
//   raw: fs.readFileSync('./public/templates/index.html').toString(),
//   compiled: '',
//   compose: function(cb) {

//     var asset = this;
//     var html = this.raw;
//     var err = null;

//     // lets pull some things out of the main configuration
//     // and use them to populate the index.html page.
//     //

//     that.assets['listing.html'].compose(function(err, listing) {

//       var data = {
//         "orgname": conf['orgname'],
//         "breadcrumbs": conf['tagline'],
//         "main": listing
//       };

//       asset.compiled = Plates.bind(html, data);

//       if (cb) {
//         return cb(err, asset.compiled);
//       }
//       return asset.compiled;

//     });

//   }
// };

// assets['content.html'] = {
//   primary: true,
//   raw: fs.readFileSync('./public/templates/content.html').toString(),
//   compiled: {},
//   compose: function(reponame, cb) {

//     var asset = this;
//     var html = this.raw;
//     var err = null;

//     //
//     // in the case where there is a post recieve hook, this function will
//     // be called with a specific reponame and a callback, but in the launch
//     // case, there will be no specific repo name provided. In that case we
//     // want to iterate over all the repos and generate all the content.
//     //

//     if (reponame) {
      
//       github.repo(reponame, function(repo) {
//         github.conf(reponame, function(cfg) {
//           github.content(reponame, function(content) {

//             var data = {
//               "orgname": conf['orgname'],
//               "breadcrumbs": cfg.title,
//               "main": content
//             };

//             asset.compiled[reponame] = Plates.bind(html, data);

//             if (cb) {
//               return cb(err, asset.compiled[reponame]);
//             }
//             return asset.compiled;

//           });
//         });
//       });

//     }
//     else {

//       github.repos(function(response) {

//         async.forEach(
//           response,
//           function(repo, next) {

//             github.conf(reponame, function(cfg) {
//               github.content(repo.name, function(content) {

//                 var data = {
//                   "orgname": conf['orgname'],
//                   "breadcrumbs": cfg.title,
//                   "main": content
//                 };

//                 asset.compiled[repo.name] = Plates.bind(html, data);
//                 next();
//               });
//             });

//           },
//           function(err) {

//             if (err) {
//               throw new Error(err);
//             }
//             return cb(err, asset.compiled);
//           }
//         );

//       });
//     }
//   }
// };