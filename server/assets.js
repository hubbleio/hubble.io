
var fs = require('fs');
var Plates = require('plates');
var assets = module.exports;

//
// each asset contains two members. One is a `composer` function with special 
// instructions on what to do with the other property, the raw html value.
//
assets['article.html'] = {
  raw: fs.readFileSync('./public/assets/article.html').toString(),
  compose: function(repos) {

    var html = this.raw;
    var output = '';
 
    if (repos.meta) {
      var data = {
        "orgname": 'Orgname', // conf['orgname']
        "title": repos.meta.title,
        "main": repos.markup
      };
    }
    
    return repos.composed = Plates.bind(html, data);
  }
};

assets['contributors.html'] = {
  raw: fs.readFileSync('./public/assets/contributers.html').toString(),
  compose: function(repos) {
    var output = '';
    return output;
  }
};

assets['listing.html'] = {
  raw: fs.readFileSync('./public/assets/listing.html').toString(),
  compose: function(repos) {

    var html = this.raw;

    var data = {};
    var output = '';

    Object.keys(repos).forEach(function(name, index) {

      if (repos[name].forks) {

        data = {
          "description": repos[name].description,
          "fork": repos[name].forks,
          "like": repos[name].watchers,
          "created": repos[name].created_at,
          "updated": repos[name].updated_at,
          "name": '/article/' + repos[name].name,
          "title": repos[name].title
        };

        console.dir(Plates);
        var m = new Plates.Map();

        m.class('description').to('description');
        //m.class('repo').to
        m.class('fork').to('fork');
        m.class('like').to('like');
        m.class('created').to('created');
        m.class('updated').to('updated');
        m.class('name').to('name').as('href');
        m.class('title').to('title');

        console.dir(data);
        output += Plates.bind(html, data, m);
      }
          
    });

    return output;
  }
};

assets['index.html'] = {
  raw: fs.readFileSync('./public/assets/index.html').toString(),
  compose: function(repos) {

    //
    // this comp function takes the entire repos because the index
    // should be built considering all of the repos in the org.
    //
    var html = this.raw;
    var listing = assets['listing.html'];

    var data = {
      "orgname": 'Orgname', // conf['orgname']
      "title": 'Tagline', // conf['tagline']
      "articles": listing.compose(repos),
      //"contributors": assets['contributors.html'].compose(json)
    };
    
    console.dir(data.articles);

    return repos['repository-index'].composed = Plates.bind(html, data);

  }
};
