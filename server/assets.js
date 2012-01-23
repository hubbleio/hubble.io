
var fs = require('fs');
var Plates = require('plates');
var assets = module.exports;

//
// each asset contains two members. One is a `composer` function with special 
// instructions on what to do with the other property, the raw html value.
//
assets['article.html'] = {
  raw: fs.readFileSync('./public/assets/article.html').toString(),
  compose: function(cache) {

    var html = this.raw;
    var output = '';
 
    if (cache.meta) {

      var data = {
        "orgname": 'Orgname', // conf['orgname']
        "title": cache.meta.title,
        "main": cache.markup
      };

    }

    return cache.composed = Plates.bind(html, data);
  }
};

assets['contributors.html'] = {
  raw: fs.readFileSync('./public/assets/contributers.html').toString(),
  compose: function(cache) {
    var output = '';
    return output;
  }
};

assets['listing.html'] = {
  raw: fs.readFileSync('./public/assets/listing.html').toString(),
  compose: function(cache) {

    var html = this.raw;

    var data = {};
    var output = '';

    Object.keys(cache).forEach(function(name, index) {

      if (cache[name].meta) {

        data = {
          "description": cache[name].meta.description,
          "fork": cache[name].meta.repo.forks,
          "like": cache[name].meta.repo.watchers,
          "created": cache[name].meta.repo.created_at,
          "updated": cache[name].meta.repo.updated_at,
          "name": '/article/' + cache[name].meta.repo.name,
          "title": cache[name].meta.title
        };

        var m = new Plates.Map();

        m.class('description').to('description');
        //m.class('repo').to
        m.class('fork').to('fork');
        m.class('like').to('like');
        m.class('created').to('created');
        m.class('updated').to('updated');
        m.class('name').to('name').as('href');
        m.class('title').to('title');

        output += Plates.bind(html, data, m);
      }
          
    });

    return output;
  }
};

assets['index.html'] = {
  raw: fs.readFileSync('./public/assets/index.html').toString(),
  compose: function(cache) {

    //
    // this comp function takes the entire cache because the index
    // should be built considering all of the repos in the org.
    //
    var html = this.raw;
    var listing = assets['listing.html'];

    var data = {
      "orgname": 'Orgname', // conf['orgname']
      "title": 'Tagline', // conf['tagline']
      "articles": listing.compose(cache),
      //"contributors": assets['contributors.html'].compose(json)
    };

    return cache['repository-index'].composed = Plates.bind(html, data);

  }
};
