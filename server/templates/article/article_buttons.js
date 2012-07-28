module.exports = function(html, templates, conf, bind, Map, content) {

  return function(previousURL, nextURL) {

    var data = {
      'button-container':
        (previousURL ?
          templates('/article/article_button_left.html') :
          templates('/article/article_button_left_disabled.html')).call(this, previousURL) +
        (nextURL ?
          templates('/article/article_button_right.html') :
          templates('/article/article_button_right_disabled.html')).call(this, nextURL)
    };
    return bind(html, data);
  };
  
};