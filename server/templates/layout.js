module.exports = function(html, templates, conf, bind, Map, content) {

  return function(options) {
    var title = conf.title + ' - ' + options.title;
    var data = {
      head: templates('/shared/head.html').call(this, title),
      //menu: templates['categories.html'](categories),
      categories: templates('/categories/menu.html').call(this),
      main: options.main,
      title: title,
      orgname: '',
      tagline: conf.tagline,
      description: conf.description,
      beginner: conf.content.home.beginner,
      intermediate: conf.content.home.beginner,
      expert: conf.content.home.expert,
      profile: this.req.session && this.req.session.user ?
        templates('/user/profile.html').call(this) :
        templates('/user/profile_not_logged_in.html').call(this)
    };

    return bind(html, data);
  };

};