module.exports = function(html, templates, conf, bind, Map, content) {

  return function(category) {

    var child = category;
    var parts = category.id.split('--');

    var data = {
      breadcrumb: templates('/shared/breadcrumb.html').call(this, parts),
      'level-articles': category.articles.map(function(article) {
        return templates('/article/short.html').call(this, article);
      }).join(''),
      title: category.name
    };

    var main = bind(html, data);
    
    return templates('/layout.html').call(this, {
      main: main,
      title: category.name
    });
  };
};