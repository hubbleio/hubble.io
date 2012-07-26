var crypto = require('crypto');

module.exports = function(html, templates, conf, bind, Map, content) {

  return function(author, idx) {

    var map = Map();
    map['class']('avatar').to('avatar');
    map['class']('name').to('name');
    map['class']('links').to('links');
    map['class']('written-count').to('written_count');
    map['class']('some-articles').to('some_articles');
    map['class']('all-articles').to('all_articles');
    map.where('id').is('all-articles-1').use('all_articles_container_id').as('id');
    map['class']('box-button').to('button');
    //map['class']('btn-all-articles').to('fuuuck');

    var data = {
      avatar: templates('/author/avatar.html').call(this, author),
      name: author.meta.name,
      links: templates('/author/links.html').call(this, author),
      written_count: author.articles.length,
      some_articles: templates('/article/simple_list.html').call(this, author.articles.slice(0, 2)),
      all_articles: author.articles.length > 2 ?
        templates('/article/simple_list.html').call(this, author.articles.slice(2)) :
        '',
      all_articles_container_id: 'all-articles-' + idx,
      button: author.articles.length > 2 ?
        templates('/author/box_button.html').call(this, 'all-articles-' + idx) :
        ''
    };

    function wrap(content) {
      var ret = [];
      ret.push('<div class="span4 contributor');
      if (idx %3 === 0) {
        ret.push(' nomargin');
      }
      ret.push('" style="');
      if (idx % 3 === 0) {
        ret.push('clear:left;');
      }
      if (idx % 3 === 0 && idx > 0) {
        ret.push('margin-top: 20px;');
      }
      ret.push('">');

      ret.push(content);

      ret.push('</div>');

      return ret.join('');
    }

    return wrap(bind(html, data, map));
  };
  
};