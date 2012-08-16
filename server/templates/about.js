module.exports = function(html, templates, conf, bind) {

  return function() {

    var data = {
      members: conf.team.map(templates('/team/box.html')).join('')
    };

    return templates('/layout.html').call(this, {
      main: bind(html, data),
      title: 'About'
    });
  };
};