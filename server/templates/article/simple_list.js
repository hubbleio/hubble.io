module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  map['class']('article-link').to('title');
  map['class']('article-link').to('url').as('href');

  return function(articles) {
    var data = articles.map(function(article) {
      return {
        title: article.meta.title,
        url: '/articles/' + encodeURIComponent(article.name)
      };
    });
    return bind(html, data, map);
  };
  
};