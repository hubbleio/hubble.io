var difficultyLevels = require('../../../lib/difficulty_levels');

module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();

  map.where('href').is('/to-github').use('github_url').as('href');
  
  map.className('breadcrumb').to('breadcrumb');
  map.className('breadcrumb-element').to('breadcrumb-element');
  map.className('category-name').to('breadcrumb-name');
  map.className('category-name').to('breadcrumb-url').as('href');

  map.className('article-body').to('article-body');
  map.className('button-container').to('button-container');
  map.where('href').is('/left').use('left-url').as('href');
  map.where('href').is('/right').use('right-url').as('href');
  
  map.className('author').to('author');
  map.className('author-info').to('author-info');
  map.className('other-articles-title').to('other-articles-title');
  map.className('short-list-article').to('short-list-article');
  map.className('short-list-article-link').to('short-list-article-link');
  map.className('short-list-article-link').use('short-list-article-link-url').as('href');

  return function(article, prefix, cat, level) {

    var previous, next, idx, levelString, otherArticles;

    function articleURL(article) {
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

      'breadcrumb': article.meta.categories.map(function(catList) {
        var cats = [];
        if (! Array.isArray(catList)) catList = [catList];
        return {
          'breadcrumb-element': catList.map(function(cat, idx) {
            cats.push(cat);
            return {
              'breadcrumb-name': cat,
              'breadcrumb-url': '/categories/' + encodeURIComponent(cats.join('--'))
            };
          })
        };
      }),

      'article-body': article.markup,

      'button-container': {
        'left-url': previous || '',
        'right-url': next || ''
      },

      'author-info': 'ABC',
      //article.meta.authors.map(templates('/author/info.html')),
      
      author: article.meta.authors.map(function(author) {
        return {
          'author-info': templates('/author/info.html')(author),
          'other-articles-title': 'Other articles from this author:',
          'short-list-article': author.articles.filter(function(otherArticle) {
            return otherArticle != article;
          }).map(function(article) {
            return {
              'short-list-article-link': article.name,
              'short-list-article-link-url': '/guides/' + encodeURIComponent(article.name)
            };
          })
        };
      }),

      github_url: article.github.html_url
    };

    return templates('/layout.html').call(this, {
      main: bind(html, data, map),
      title: article.meta.title
    });
  };
};