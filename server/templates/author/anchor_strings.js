var crypto = require('crypto');

module.exports = function(html, templates, conf, bind, Map, content) {

  return function(authors) {

    var map = Map();
    map['class']('authors').to('authors');

    console.log('authors:', authors);

    return authors.map(function(author) {
      var data = {
        authors: templates('/author/anchor_string.html').call(this, author)
      };

      return bind(html, data, map);
    }).join(', ');
  };
  
};