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
    var categories = content.index.categories.slice(0);

    var categoriesMarkup = '';

    while(categories.length) {
      var lineCount = 0;
      var cats = [];
      while (lineCount < 3 && categories.length) {
        var cat = categories.splice(0, 1)[0];
        lineCount ++;
        if (cat.children && cat.children.length) {
          lineCount ++;
          lineCount += (cat.children.length - 1) / 2;
        }
        cats.push(cat);
      }
      categoriesMarkup += templates('/categories/menu_group.html')(cats);
    }

    var map = Map();
    map['class']('container').to('categories');

    var data = {
      categories: categoriesMarkup
    };

    return bind(html, data, map);
  };
  
};