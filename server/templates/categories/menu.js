function prop(propName) {
  return function(o) {
    return o[propName];
  };
}

module.exports = function(html, templates, conf, bind, Map, content) {

  return function() {

    //
    // clone the categories so we can reduce it
    //
    var categories = content.index.categories.map(prop('name')).slice(0);

    var categoriesMarkup = '';

    while(categories.length) {
      var cats = categories.splice(0, 3);
      categoriesMarkup += templates('/categories/menu_group.html')(cats);
    }

    var map = Map();
    map.class('container').to('categories');

    var data = {
      categories: categoriesMarkup
    }

    return bind(html, data, map);
  };
  
};