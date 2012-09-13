var moment = require('../../lib/moment');

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
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


  return function(level, articles) {

    var urlBase = '/levels/' + encodeURIComponent(level);

    var data = {
      'breadcrumb': {
        'breadcrumb-element': [
          {
            'breadcrumb-name': 'Levels',
            'breadcrumb-url': ''
          },
          {
            'breadcrumb-url': urlBase,
            'breadcrumb-name': capitaliseFirstLetter(level)
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

      title: capitaliseFirstLetter(level)
    };

    return templates('/layout.html').call(this, {
      main: bind(html, data, map),
      title: ['Levels', capitaliseFirstLetter(level)].join(' - ')
    });
  };
};