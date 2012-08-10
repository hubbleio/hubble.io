var crypto = require('crypto');

module.exports = function(html, templates, conf, bind, Map, content) {

  return function(author, article) {

    var otherArticles = author.articles.filter(function(otherArticle) {
      return otherArticle != article;
    });

    var data = {
      info: templates('/author/info.html').call(this, author),
      'other-articles': otherArticles.length ?
        templates('/article/short_list.html').call(this, 'Other articles from this author:', otherArticles) :
        ''
    };

    return bind(html, data);
  };
  
};