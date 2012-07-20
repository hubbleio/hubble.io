module.exports = function(html, templates, conf, bind, Map, content) {

  return function(article) {
    var map = Map();
    map.class('title').to('title');
    map.class('title').to('url').as('href');
    var data = {
      title: article.name,
      url: '/articles/' + encodeURIComponent(article.name)
    };
    return bind(data, html, map);
  };
  
};