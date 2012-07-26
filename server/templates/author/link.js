var crypto = require('crypto');

module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  map['class']('author-link').to('type').as('title');
  map['class']('author-link').to('url').as('href');

  return function(type, url) {

    var data = {
      url: url,
      type: type
    };

    return bind(html, data, map);
  };
  
};