var moment = require('../../../lib/moment');

module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  
  map.className('breadcrumb-element').to('breadcrumb-element');
  map.className('breadcrumb-name').to('breadcrumb-name');
  map.className('breadcrumb-name').use('breadcrumb-url').as('href');

  map.className('article').use('article');
  map.className('title').to('title');
  map.className('title').use('url').as('href');
  
  map.className('author').to('author');
  map.className('author-name').use('author-name');
  map.className('author-name').use('author-url').as('href');
  
  map.className('when').to('when');
  map.className('description').to('description');
  map.where('href').is('/to-article').use('url').as('href');
  map.where('href').is('/star').use('rate_url').as('href');

  map.className('author-beside').to('author-beside');
  map.className('author-info').to('author-info');

  return function(author) {

    var data = {
      'breadcrumb-element': [
        {
          'breadcrumb-name': 'Authors',
          'breadcrumb-url' : '/authors'
        },
        {
          'breadcrumb-name': author.meta.name,
          'breadcrumb-url' : '/authors/' + encodeURIComponent(author.meta.name)
        }
      ],

      'article': author.articles.map(function(article) {

        var url = '/guides/' + encodeURIComponent(article.name);

        return {
          title: article.meta.title,
          author: article.meta.authors.map(function(author) {
            return {
              'author-name': author.meta.name,
              'author-url': '/authors/' + encodeURIComponent(author.meta.name)
            };
          }),
          when: moment(article.github.created_at).fromNow(),
          description: article.meta.intro,
          url: url,
          rate_url: url + '/star'
        };
      }),

      title: author.meta.name,

      'author-beside': {
        'author-info': templates('/author/info.html')(author),
        'other-articles-title': 'Other articles from this author:'
      }

    };

    return templates('/layout.html').call(this, {
      main: bind(html, data, map),
      title: author.meta.name
    });
  };
};