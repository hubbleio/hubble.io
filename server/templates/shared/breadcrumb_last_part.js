module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  map['class']('category-name').to('name');
  map['class']('category-name').to('url').as('href');

  return function(part) {
    var data = {
      url: '/categories/' + encodeURIComponent(part),
      'name': part
    };
    return bind(html, data, map);
  };
};