var difficultyLevels = require('../../lib/difficulty_levels');

module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  map.where('href').is('/to-github').use('github_url').as('href');
  map['class']('breadcrumbs').to('breadcrumbs');
  map['class']('article-body').to('article-body');
  map['class']('author').to('author');

  return function(article, prefix, cat, level) {

    var previous, next, idx, levelString, otherArticles;

    function articleURL(article) {
      //if (! article) { return ''; }
      url = '';
      if (prefix) {
        url += prefix;
      }
      url += '/guides/' + encodeURIComponent(article.name);
      return url;
    }

    if (! cat && ! level) {
      cat = article.meta.categories[0];
      if (('object' !== typeof cat) || Array.isArray(cat)) {
        cat = content.index.searchCategory(cat);
      }
    }
    
    if (cat) {
      otherArticles = cat.articles;
    } else if (level) {
      levelString = difficultyLevels.toString(article.meta.difficulty);
      otherArticles = content.index.byDifficultyLevel[levelString];
    }

    if (otherArticles) {
      idx = otherArticles.indexOf(article);
      if (idx > 0) {
        previous = articleURL(otherArticles[idx - 1]);
      }
      if (idx > -1 && idx < otherArticles.length - 1) {
        next = articleURL(otherArticles[idx + 1]);
      }
    }


    var data = {

      'breadcrumbs': article.meta.categories.map(function(catList) {
        return templates('/shared/breadcrumb.html').call(this, catList);
      }).join(''),
      
      'article-body': templates('/article/body.html').call(this, article, previous, next),
      
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