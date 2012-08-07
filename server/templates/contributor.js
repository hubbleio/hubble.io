module.exports = function(html, templates, conf, bind, Map, content) {

  return function(author) {

    var parts = [
      {
        label: author.meta.name,
        url: '/contributors/' + encodeURIComponent(author.meta.name)
      }
    ];

    var data = {
      breadcrumb: templates('/shared/breadcrumb.html').call(this, parts),
      'level-articles': author.articles.map(function(article) {
        return templates('/article/short.html').call(this, article);
      }).join(''),
      title: author.meta.name
    };

    var main = bind(html, data);
    
    return templates('/layout.html').call(this, {
      main: main,
      title: author.meta.name
    });
  };
};