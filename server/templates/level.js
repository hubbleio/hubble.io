module.exports = function(html, templates, conf, bind, Map, content) {

  return function(level, articles) {

    var urlBase = '/levels/' + encodeURIComponent(level);

    var parts = [{
      url: urlBase,
      label: level
    }];

    var data = {
      breadcrumb: templates('/shared/breadcrumb.html').call(this, parts),
      'level-articles': articles.map(function(article) {
        return templates('/article/short.html').call(this, article, urlBase);
      }).join(''),
      title: level
    };

    var main = bind(html, data);
    
    return templates('/layout.html').call(this, {
      main: main,
      title: ['Levels', level].join(' - ')
    });
  };
};