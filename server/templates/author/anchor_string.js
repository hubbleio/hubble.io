var crypto = require('crypto');

module.exports = function(html, templates, conf, bind, Map, content) {

  return function(author) {

    var map = Map();
    map['class']('author').to('author');
    map['class']('author').to('author_url').as('href');

    var data = {
      author: author.name,
      author_url: '/authors/' + encodeURIComponent(author.name)
    };

    return bind(html, data, map);
  };
  
};