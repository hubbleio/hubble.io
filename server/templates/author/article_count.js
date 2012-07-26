var crypto = require('crypto');

module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  map['class']('article-count').to('article_count');

  return function(author) {

    var data = {
      article_count: author.articles.length
    };

    return bind(html, data, map);
  };
  
};