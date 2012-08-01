function prop(propName) {
  return function(o) {
    return o[propName];
  };
}

function serialize(cat) {
  var name = [cat.name];
  if (cat.children) {
    name = name.concat(cat.children.map(serialize));
  }
  return name.join(' > ');
}

module.exports = function(html, templates, conf, bind, Map, content) {

  return function(cat) {

    var data = {
      category: serialize(cat)
    };

    return bind(html, data);
  };

};