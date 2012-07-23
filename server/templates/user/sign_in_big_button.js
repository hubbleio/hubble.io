module.exports = function(html, templates, conf, bind, Map, content) {

  return function() {

    //
    // clone the categories so we can reduce it
    //
    var map = Map();
    map['class']('title').to('title');

    var data = {
      title: conf.title
    };

    return bind(html, data, map);
  };
  
};