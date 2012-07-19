module.exports = function(html, templates, conf, bind, articles) {



  return function(html) {
    var data = {
      'guides-popular': templates('/article/list')(popularGuides),
      'guides-new': templates('/articles/')(newGuides)
    };

    var main = bind(data, html);
    return templates('/layout.html')({
      main: main,
      title: 'Home',
      orgname: conf.title
    });
  };
};