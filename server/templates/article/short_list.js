var moment = require('../../../lib/moment');

module.exports = function(html, templates, conf, bind, Map, content) {

  return function(title, articles) {
    var data = {
      title: title,
      'short-list': templates('/article/simple_list.html').call(this, articles)
    };
    return bind(html, data);
  };
  
};