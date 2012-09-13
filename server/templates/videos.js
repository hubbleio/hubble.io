var moment = require('../../lib/moment');

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

  map.className('author').to('author');
  map.className('author-list-link').to('author-name');
  map.className('author-list-link').to('author-url').as('href');


  return function() {

    var articles = content.index.videos;

    var data = {
      'breadcrumb': {
        'breadcrumb-element': [
          {
            'breadcrumb-url': '/videos',
            'breadcrumb-name': 'Videos'
          }
        ]
      },

      'article': articles.map(function(article) {

        var url = '/guides/' + encodeURIComponent(article.name);

        return {
          title: article.meta.title,
          authors: article.meta.authors.map(function(author) {
            return {
              'author-name': author.meta.name,
              'author-url' : '/authors/' + encodeURIComponent(author.meta.name)
            };
          }),
          when: moment(article.github.created_at).fromNow(),
          description: article.meta.intro,
          url: url,
          rate_url: url + '/star'
        };

      }),

      'author': content.index.videoAuthors.map(function(author) {
        return {
          'author-name': author.meta.name,
          'author-url': '/authors/' + encodeURIComponent(author.meta.name)
        };
      }),

      title: 'Videos'
    };

    return templates('/layout.html').call(this, {
      main: bind(html, data, map),
      title: 'Videos'
    });
  };
};