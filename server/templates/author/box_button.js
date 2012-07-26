var crypto = require('crypto');

module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  map.where('data-target').is('all-articles-target').use('all_articles_container_id_search').as('data-target');

  return function(allArticlesContainerId) {
    var data = {
      all_articles_container_id_search: '#' + allArticlesContainerId
    };
    return bind(html, data, map);
  };
  
};