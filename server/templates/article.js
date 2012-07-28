module.exports = function(html, templates, conf, bind, Map, content) {

  return function(article) {

    var previous;
    var next = '/direita';

    var data = {
      
      'breadcrumbs': article.meta.categories.map(function(catList) {
        return templates('/shared/breadcrumb.html').call(this, catList);
      }).join(''),
      
      'article-body': [
        article.markup,
        templates('/article/article_buttons.html').call(this, previous, next)
      ].join(''),
      
      author: article.meta.authors.map(function(author) {
        return templates('/author/in_article.html').call(this, author, article);
      }).join('')
    };

    var main = bind(html, data);
    return templates('/layout.html').call(this, {
      main: main,
      title: article.meta.title
    });
  };
};