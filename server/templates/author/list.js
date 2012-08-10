module.exports = function(html, templates, conf, bind, Map, content) {

  return function() {

    var list = Object.keys(content.index.byAuthor).map(function(authorName) {
      return content.index.byAuthor[authorName];
    }).sort(function(a, b) {
      return b.articles.length - a.articles.length;
    }).map(function(author) {
      return templates('/author/avatar.html').call(this, author);
    }).join('');

    var map = Map();
    map['class']('author-list').to('list');
    var data = {
      list: list
    };

    return bind(html, data, map);
  };
  
};