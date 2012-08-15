module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  map['class']('twitter').to('twitter').as('href');
  map['class']('github').to('github').as('href');

  return function() {
    var data = {
      twitter: conf.twitter,
      github: conf.github
    };

    return bind(html, data, map);
  };
};