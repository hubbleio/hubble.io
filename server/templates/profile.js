module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  map.className('article-request').to('article-request');
  map.className('article-request-link').to('title');
  map.className('article-request-link').use('url').as('href');
  map.className('label').use('class').as('class');
  map.className('label').to('state');

  return function(articleRequests) {

    var data = {
      'article-request': articleRequests.length ? articleRequests.map(function(articleRequest) {
        return {
          'url':   '/profile/article-requests/' + encodeURIComponent(articleRequest._id),
          'title': '› ' + articleRequest.title,
          'state': articleRequest.state,
          'class': 'label label-' + articleRequest.state
        };

      }) : 'You have none.'
    };

    return templates('/layout.html').call(this, {
      main: bind(html, data, map),
      title: 'Profile - Article Requests'
    });
  };
};