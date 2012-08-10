var crypto = require('crypto');

var titleMap = {
  github: 'Github account',
  twitter: 'Twitter account'
};

module.exports = function(html, templates, conf, bind, Map, content) {

  return function(author) {

    var ret = [];

    ['twitter', 'github'].forEach(function(type) {
      ret.push(templates('/author/link.html').call(this, titleMap[type] || '', author.meta[type]));
    });

    ret.push(templates('/author/article_count.html').call(this, author));

    return ret.join('');
  };
  
};