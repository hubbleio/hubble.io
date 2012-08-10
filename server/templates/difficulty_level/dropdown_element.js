module.exports = function(html, templates, conf, bind, Map, content) {

  return function(level) {
    var data = {
      'difficulty-level': level
    };

    return bind(html, data);
  };

};