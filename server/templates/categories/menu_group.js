module.exports = function(html, templates, conf, bind, Map, content) {

  return function(categories) {

    var map = Map();
    map.class('category-group').to('categories');

    var data = {
      categories: categories.map(function(category) {
        return templates('/categories/menu_item.html')(category);
      }).join('')
    };

    return bind(html, data, map);
  };
  
};