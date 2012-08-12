module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  map['class']('article-request').use('title');
  map['class']('article-request').use('url').as('href');

  return function(articleRequest) {

    var data = {
      'url': '/profile/article-requests/' + encodeURIComponent(articleRequest._id),
      'title': articleRequest.title
    };

    var label;
    try {
      label = templates('/profile/' + articleRequest.state + '.html').call(this);
    } catch(err) {
      console.error(err);
    }

    return '<li>' + bind(html, data, map) + label + '</li>';
  };
};