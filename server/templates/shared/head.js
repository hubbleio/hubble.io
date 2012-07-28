module.exports = function(html, templates, conf, bind, Map, content) {

  return function(part) {
    var metaLoggedIn = (this.req.session && this.req.session.user) ?
      templates('/shared/meta_logged_in.html').call(this) :
      templates('/shared/meta_not_logged_in.html').call(this);
    return html + metaLoggedIn;
  };
};