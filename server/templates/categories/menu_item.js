module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  map['class']('category-item').to('name');
  map['class']('category-item').to('url').as('href');

  return function(category, prefix) {

    if (! prefix) {
      prefix = '';
    }
    var name = prefix + category.name;
    if (category.children && category.children.length) {
      name += templates('/categories/menu_group.html').call(this, category.children, '› ');
    }

    var data = {
      name: name,
      url: '/categories/' + encodeURIComponent(category.id)
    };

    return bind(html, data, map);
  };
  
};