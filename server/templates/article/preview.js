module.exports = function(html, templates, conf, bind, Map, content) {

  return function(article) {

    var data = {
      
      'breadcrumbs': article.meta.categories.map(function(catList) {
        return templates('/shared/breadcrumb.html').call(this, catList);
      }).join(''),
      
      'article-body': article.markup
    };

    var main = bind(html, data);
    return templates('/layout.html').call(this, {
      main: main,
      title: article.meta.title
    });
  };
};