var moment = require('../../../lib/moment');

module.exports = function(html, templates, conf, bind, Map, content) {

  return function(article) {
    var map = Map();
    map['class']('title').to('title');
    map['class']('title').to('url').as('href');
    map['class']('authors').to('authors');
    map['class']('published-when').to('published_when');
    map['class']('intro').to('intro');
    var data = {
      title: article.meta.title,
      url: '/articles/' + encodeURIComponent(article.name),
      authors: templates('/author/anchor_strings.html').call(this, article.meta.authors),
      published_when: moment(article.github.updated_at).fromNow(),
      intro: article.meta.description
    };
    return bind(html, data, map);
  };
  
};