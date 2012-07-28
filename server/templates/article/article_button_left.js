module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  map.where('href').is('#url').use('url').as('href');

  return function(url) {

    var data = {
      url: url
    };
    return bind(html, data, map);
  };
  
};