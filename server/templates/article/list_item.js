var moment = require('../../../lib/moment');

module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  map['class']('title').to('title');
  map['class']('title').to('url').as('href');
  map['class']('authors').to('authors');
  map['class']('published-when').to('published_when');
  map['class']('intro').to('intro');

  return function(article) {
    var data = {
      title: article.meta.title,
      url: '/guides/' + encodeURIComponent(article.name),
      authors: templates('/author/anchor_strings.html').call(this, article.meta.authors),
      published_when: moment(article.github.updated_at).fromNow(),
      intro: article.meta.description
    };
    return bind(html, data, map);
  };
  
};