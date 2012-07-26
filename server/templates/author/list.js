module.exports = function(html, templates, conf, bind, Map, content) {

  return function() {

    var list = Object.keys(content.index.byAuthor).map(function(authorName) {
      return templates('/author/avatar.html').call(this, content.index.byAuthor[authorName]);
    }).join('');

    var map = Map();
    map['class']('author-list').to('list');
    var data = {
      list: list
    };

    return bind(html, data, map);
  };
  
};