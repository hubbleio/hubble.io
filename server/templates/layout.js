module.exports = function(html, templates, conf, bind) {
  return function(main, options) {
    var data = {
      //menu: templates['categories.html'](categories),
      main: main,
      orgname: conf.orgname || 'Orgname',
      title: 'Node Guides - ' + options.title
    };

    return bind(html, data);
  };

};