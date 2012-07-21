module.exports = function(html, templates, conf, bind, map, content) {

  var popularGuides = content.index.byPopularity.slice(0, 2);
  var newGuides = content.index.byCreationDate.slice(0, 2);

  return function() {
    var data = {
      'guides-popular': templates('/article/list.html')('Popular guides', popularGuides),
      'guides-new':     templates('/article/list.html')('New guides', newGuides)
    };

    var main = bind(html, data);
    return templates('/layout.html')({
      main: main,
      title: 'Home',
      orgname: conf.title
    });
  };
};