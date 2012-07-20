module.exports = function(html, templates, conf, bind, map, content) {

  return function(title, articles) {

    var list = articles.map(function(article) {
      return templates('/article/list_item.html')(article);
    }).join('');

    var data = {
      title: title,
      list: list
    };
    return bind(data, html);
  };
  
};