module.exports = function(html, templates, conf, bind, Map, content) {

  return function(article) {

    var data = {
      'article-body': article.markup
    };

    var main = bind(html, data);
    return templates('/layout.html').call(this, {
      main: main,
      title: article.meta.title
    });
  };
};