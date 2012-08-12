module.exports = function(html, templates, conf, bind, Map, content) {

  return function(articleRequests) {

    var data = {
      'article-requests': articleRequests.map(function(articleRequest) {
        return templates('/profile/article_request.html').call(this, articleRequest);
      }).join('')
    };

    var main = bind(html, data);
    return templates('/layout.html').call(this, {
      main: main,
      title: 'Profile - Article Requests'
    });
  };
};