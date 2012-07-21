module.exports = function(html, templates, conf, bind, Map, content) {
  return function(options) {
    var map = Map();
    map.class('orgname').to('orgname');

    var data = {
      //menu: templates['categories.html'](categories),
      categories: templates('/categories/menu.html')(content.index.categories),
      main: options.main,
      title: conf.title + ' - ' + options.title,
      orgname: conf.title,
      tagline: conf.tagline,
      description: conf.description,
      beginner: conf.content.home.beginner,
      intermediate: conf.content.home.beginner,
      expert: conf.content.home.expert
    };

    return bind(html, data);
  };

};