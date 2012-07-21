module.exports = function(html, templates, conf, bind, Map, content) {

  return function(category) {

    var map = Map();
    map.class('category-item').to('name');
    map.class('category-item').to('url').as('href');

    var data = {
      name: category,
      url: '/categories/' + encodeURIComponent(category)
    };

    return bind(html, data, map);
  };
  
};