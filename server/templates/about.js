module.exports = function(html, templates, conf, bind, Map) {

  var map = Map();
  map.where('role').is('member').to('member');
  map.className('name').to('name');
  map.className('role').to('role');
  map.className('bio').to('bio');
  map.className('avatar').use('avatar').as('src');
  map.className('twitter-a').use('twitter').as('href');
  map.className('github-a').use('github').as('href');

  return function() {

    var data = {
      member: conf.team
    };

    return templates('/layout.html').call(this, {
      main: bind(html, data, map),
      title: 'About'
    });
  };
};