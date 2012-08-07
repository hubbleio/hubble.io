function makeSafe(text) {
  return text.replace(/\W/g, function (chr) {
    return '&#' + chr.charCodeAt(0) + ';';
  });
}

module.exports = function(html, templates, conf, bind, Map, content) {

  return function() {

    //
    // clone the categories so we can reduce it
    //
    var map = Map();
    map['class']('username').to('username');

    var data = {
      username: makeSafe(this.req.session.user.login)
    };

    return bind(html, data, map);
  };
  
};