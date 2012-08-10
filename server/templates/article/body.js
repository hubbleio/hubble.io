module.exports = function(html, templates, conf, bind, Map, content) {

  return function(article, previous, next) {

    return [
      html,
      article.markup,
      templates('/article/article_buttons.html').call(this, previous, next)
    ].join('');
  };
};