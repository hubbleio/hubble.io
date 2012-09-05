var crypto = require('crypto');

module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();

  map['class']('avatar').to('avatar');
  map['class']('name').to('name');

  map.where('role').is('link').to('link');
  map.where('role').is('link').use('link-class').as('class');
  map.className('author-link').use('link-url').as('href');
  map.where('role').is('count').to('written_count');

  return function(author) {

    var links = [];
    ['github', 'twitter'].forEach(function(type) {
      if (author.meta[type]) {
        links.push({
            'link-class': type,
            'link-url': author.meta[type]
          });
      }
    });

    var data = {
      avatar: templates('/author/avatar.html').call(this, author),
      name: author.meta.name,
      link: links,
      written_count: author.articles.length
    };

    return bind(html, data, map);
  };
  
};
