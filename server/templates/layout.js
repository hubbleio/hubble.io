module.exports = function(html, templates, conf, bind, Map, content) {
  return function(options) {
    var data = {
      //menu: templates['categories.html'](categories),
      categories: templates('/categories/menu.html').call(this),
      main: options.main,
      title: conf.title + ' - ' + options.title,
      orgname: '',
      tagline: conf.tagline,
      description: conf.description,
      beginner: conf.content.home.beginner,
      intermediate: conf.content.home.beginner,
      expert: conf.content.home.expert,
      profile: this.req.session.user ?
        templates('/user/profile.html').call(this) :
        templates('/user/profile_not_logged_in.html').call(this),
      head: templates('/shared/head.html').call(this)
    };

    return bind(html, data);
  };

};