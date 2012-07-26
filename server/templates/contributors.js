module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  map['class']('orgname').to('orgname');
  map['class']('contributors-listing').to('contributors_listing');

  return function() {

    var contributors = Object.keys(content.index.byAuthor).map(function(authorName, idx) {
      return templates('/author/box.html').call(this, content.index.byAuthor[authorName], idx);
    }).join('');

    var data = {
      orgname: conf.orgname,
      contributors_listing: contributors
    };

    var main = bind(html, data, map);
    return templates('/layout.html').call(this, {
      main: main,
      title: 'Contributors'
    });
  };
};