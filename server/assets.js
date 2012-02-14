
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


    var map = new Plates.Map();

    map.class('description').to('description');
    //m.class('repo').to
    map.class('fork').to('fork');
    map.class('like').to('like');
    map.class('created').to('created');
    map.class('updated').to('updated');
    map.class('name').to('name').as('href');
    map.class('title').to('title');

    var data = {};
    var output = '';

    Object.keys(repos).forEach(function(name, index) {
      var repo = repos[name];

      if (repo.meta) {

        console.log('repo.meta:', repo.meta);

        data = {
          "description": repo.meta.description || repo.description,
          "fork": repo.forks,
          "like": repo.watchers,
          "created": repo.created_at,
          "updated": repo.updated_at,
          "name": '/article/' + repo.name,
          "title": repo.meta.title || repo.title
        };


        console.dir(data);
        output += Plates.bind(html, data, map);
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
