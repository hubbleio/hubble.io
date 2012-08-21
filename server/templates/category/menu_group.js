module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  map['class']('category-group').to('categories');

  return function(categories, prefix) {

    if (! prefix) { prefix = ''; }

    var data = {
      categories: categories.map(function(category) {
        return templates('/category/menu_item.html').call(this, category, prefix);
      }).join('')
    };

    return bind(html, data, map);
  };
  
};