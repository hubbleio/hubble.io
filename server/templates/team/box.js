module.exports = function(html, templates, conf, bind, Map) {

  var map = Map();
  map['class']('name').to('name');
  map['class']('role').to('role');
  map['class']('bio').to('bio');
  map['class']('avatar').use('avatar').as('src');
  map['class']('twitter-a').use('twitter').as('href');
  map['class']('github-a').use('github').as('href');

  return function(member) {
    return bind(html, member, map);
  };
};