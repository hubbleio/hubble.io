module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  map.where('href').is('/to-github').use('github_url').as('href');
  map['class']('breadcrumbs').to('breadcrumbs');
  map['class']('article-body').to('article-body');
  map['class']('author').to('author');

  return function(cat, article, inCategory) {

    var previous;
    var next;

    function articleURL(article) {
      //if (! article) { return ''; }
      url = '';
      if (cat) {
        url += '/categories/' + encodeURIComponent(cat.id);
      }
      url += '/guides/' + encodeURIComponent(article.name);
      return url;
    }

    if (!cat) {
      cat = article.meta.categories[0];
    }
    if (('object' !== typeof cat) || Array.isArray(cat)) {
      cat = content.index.searchCategory(cat);
    }
    
    if (cat) {
      var idx = cat.articles.indexOf(article);
      if (idx > 0) {
        previous = articleURL(cat.articles[idx - 1]);
      }
      if (idx > -1 && idx < cat.articles.length - 1) {
        next = articleURL(cat.articles[idx + 1]);
      }
    }

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
      }).join(''),

      github_url: article.github.html_url
    };

    var main = bind(html, data, map);
    return templates('/layout.html').call(this, {
      main: main,
      title: article.meta.title
    });
  };
};