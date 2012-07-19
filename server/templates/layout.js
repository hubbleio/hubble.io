module.exports = function(html, templates, conf, bind, Map) {
  return function(options) {
    var map = Map();
    map.class('orgname').to('orgname');

    var data = {
      //menu: templates['categories.html'](categories),
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