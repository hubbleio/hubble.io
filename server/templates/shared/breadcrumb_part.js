module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  map['class']('category-name').to('name');
  map['class']('category-name').to('url').as('href');

  return function(part) {
    var url = part.url || ('/categories/' + encodeURIComponent(part.id || part));
    var name = part.label || part;
    var data = {
      url: url,
      'name': name
    };
    return bind(html, data, map);
  };
};