module.exports = function(html, templates, conf, bind, Map, content) {

  return function() {

    console.log('this.req', this.req);

    //
    // clone the categories so we can reduce it
    //
    var map = Map();
    map['class']('username').to('username');

    var data = {
      username: this.req.session.user.login
    };

    return bind(html, data, map);
  };
  
};