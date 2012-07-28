var crypto = require('crypto');

module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  map['class']('avatar').to('avatar');
  map['class']('name').to('name');
  map['class']('links').to('links');
  map['class']('written-count').to('written_count');

  return function(author) {

    var data = {
      avatar: templates('/author/avatar.html').call(this, author),
      name: author.meta.name,
      links: templates('/author/links.html').call(this, author),
      written_count: author.articles.length
    };

    return bind(html, data, map);
  };
  
};
