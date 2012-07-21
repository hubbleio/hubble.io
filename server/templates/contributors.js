module.exports = function(html, templates, conf, bind, map, content) {

  return function() {
    var data = {
    };

    var main = bind(html, data);
    return templates('/layout.html')({
      main: main,
      title: 'Contributors',
      orgname: conf.title
    });
  };
};