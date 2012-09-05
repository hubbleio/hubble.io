var moment = require('../../../lib/moment');

module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  map['class']('title').to('title');
  map['class']('title').to('url').as('href');
  map['class']('authors').to('authors');
  map['class']('published-when').to('published_when');
  map['class']('intro').to('intro');

  map.className('author').to('author');
  map.className('author-name').use('author-name');
  map.className('author-name').use('author-url').as('href');

  return function(title, articles) {

    var list = articles.map(function(article) {
      return {
        title: article.meta.title,
        url: '/guides/' + encodeURIComponent(article.name),
        author: article.meta.authors.map(function(author) {
          return {
            'author-name': author.meta.name,
            'author-url': '/authors/' + encodeURIComponent(author.meta.name)
          };
        }),
        published_when: moment(article.github.updated_at).fromNow(),
        intro: article.meta.description
      };
    });

    var data = {
      title: title,
      list: list
    };
    return bind(html, data, map);
  };
  
};