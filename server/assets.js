
var fs = require('fs');
var Plates = require('plates');
var assets = module.exports;

//
// each asset contains two members. One is a `composer` function with special 
// instructions on what to do with the other property, the raw html value.
//

assets['article.html'] = {
  raw: '/public/assets/listing.html',
  compose: function(json) {

    var asset = this;
    var html = asset.raw;
    var output = '';

    // //
    // // get all the repos for the specified org and iterate over them
    // // in order to build some markup that represents them to the user.
    // //      
    // var data = {
    //   "description": json.description,
    //   "fork": json.meta.forks,
    //   "like": json.meta.watchers,
    //   "created": json.meta.created_at,
    //   "updated": json.meta.updated_at,
    //   "name": '/' + json.name,
    //   "title": cfg.title
    // };

    //   //
    //   // map our data to the html
    //   //
    //   var m = new Plates.Map();
      
    //   m.class('description').to('description');
    //   m.class('fork').to('fork');
    //   m.class('like').to('like');
    //   m.class('created').to('created');
    //   m.class('updated').to('updated');
    //   m.class('name').to('name').as('href');
    //   m.class('title').to('class');

    //   output += Plates.bind(html, data, m);

    return output;
    // });

  }
};

assets['contributors.html'] = {
  raw: '/public/assets/contributers.html',
  compose: function(json) {
    var output = '';
    return output;
  }
};

assets['listing.html'] = {
  raw: '/public/assets/listing.html',
  compose: function(json) {
    var data = {};
    var output = '';

    for (var i = 0, l = json.length; i<l; i++) {

      data = {
        "description": json[i].description,
        "fork": json[i].meta.forks,
        "like": json[i].meta.watchers,
        "created": json[i].meta.created_at,
        "updated": json[i].meta.updated_at,
        "name": '/' + json[i].name,
        "title": json[i].title
      };

      var m = new Plates.Map();
      
      m.class('description').to('description');
      m.class('fork').to('fork');
      m.class('like').to('like');
      m.class('created').to('created');
      m.class('updated').to('updated');
      m.class('name').to('name').as('href');
      m.class('title').to('class');

      output += Plates.bind(html, data, m);
    }

    return output;
  }
};

assets['index.html'] = {
  raw: '/public/assets/index.html',
  compose: function(json) {

    var asset = this;
    var html = this.raw;

    var data = {
      "orgname": 'Orgname', // conf['orgname']
      "breadcrumbs": 'Tagline', // conf['tagline']
      "main": assets['listing.html'].compose(json)//,
      //"contributors": assets['contributors.html'].compose(json)
    };

    return Plates.bind(html, data);

  }
};
