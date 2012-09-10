var moment = require('../../../lib/moment');

module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  map.className('breadcrumb').to('breadcrumb');
  map.className('breadcrumb-element').to('breadcrumb-element');
  map.className('breadcrumb-name').to('breadcrumb-name');
  map.className('breadcrumb-name').use('breadcrumb-url').as('href');
  map.className('article').use('article');

  map.className('title').to('title');
  map.className('title').use('url').as('href');
  map.className('authors').to('authors');
  map.className('author-link').to('author-name');
  map.className('author-link').use('author-url').as('href');
  map.className('when').to('when');
  map.className('description').to('description');
  map.where('href').is('/to-article').use('url').as('href');
  map.where('href').is('/star').use('rate_url').as('href');

  map.className('subcategories').to('subcategories');
  map.className('subcategory').to('subcategory');
  map.className('subcategory-link').to('subcategory-name');
  map.className('subcategory-link').use('subcategory-link').as('href');

  map.className('popular-article').to('popular-article');
  map.className('popular-article-link').to('popular-article-name');
  map.className('popular-article-link').use('popular-article-url').as('href');

  map.className('author').to('author');
  map.className('author-list-link').to('author-name');
  map.className('author-list-link').to('author-url').as('href');


  return function(category) {

    var child = category,
        parts = category.id.split('--'),
        cats = [],
        urlPrefix = '/categories/' + encodeURIComponent(category.id),
        subCategories,
        popularArticles,
        authors
        ;

    subCategories = Object.keys(category.children).map(function(subCatName) {
      var subCat = category.children[subCatName];
      return {
        'subcategory-name': subCatName,
        'subcategory-link': '/categories/' + encodeURIComponent(subCat.id)
      };
    });

    popularArticles = category.byPopularity.slice(0, 5).map(function(article) {
      return {
        'popular-article-name': article.meta.title,
        'popular-article-url': '/guides/' + encodeURIComponent(article.name)
      };
    });

    authors = category.authors.map(function(author) {
      return {
        'author-name': author.meta.name,
        'author-url': '/authors/' + encodeURIComponent(author.meta.name)
      };
    });

    var data = {

      'breadcrumb': {
        'breadcrumb-element': parts.map(function(cat, idx) {
          cats.push(cat);
          return {
            'breadcrumb-name': cat,
            'breadcrumb-url': '/categories/' + encodeURIComponent(cats.join('--'))
          };
        })
      },

      'article': category.articles.map(function(article) {

        var url = urlPrefix + '/guides/' + encodeURIComponent(article.name);

        return {
          title: article.meta.title,
          authors: article.meta.authors.map(function(author) {
            return {
              'author-name': author.meta.name,
              'author-url' : '/authors/' + encodeURIComponent(author.meta.name)
            };
          }),
          when: moment(article.github.created_at).fromNow(),
          description: article.meta.description,
          url: url,
          rate_url: url + '/star'
        };

      }),

      'title': category.name,

      'subcategories': subCategories.length ? ({
        subcategory: subCategories
      }): '',

      'popular-article': popularArticles,

      'author': authors
    };

    return templates('/layout.html').call(this, {
      main: bind(html, data, map),
      title: parts.join(' - ')
    });
  };
};