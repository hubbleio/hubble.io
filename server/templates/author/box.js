var crypto = require('crypto');

function articleMap(article) {
  return {
    'article-url': '/guides/' + encodeURIComponent(article.name),
    'article-name': article.meta.title
  };
}

module.exports = function(html, templates, conf, bind, Map, content) {

  return function(author, idx) {

    var map = Map();
    map.className('info').to('info');
    map.className('some-articles').to('some-articles');
    map.className('all-articles').to('all-articles');
    map.where('id').is('all-articles-1').use('all-articles-container-id').as('id');
    map.className('box-button').to('button');
    map.className('article').to('article');
    map.className('article-link').to('article-name');
    map.className('article-link').use('article-url').as('href');
    map.where('data-target').is('all-articles-target').insert('all-articles-container-id-search');

    var data = {
      'info': templates('/author/info.html').call(this, author),
      'some-articles': { article: author.articles.slice(0, 2).map(articleMap) },
      'all-articles': author.articles.length > 2 ?
        { article: author.articles.slice(2).map(articleMap) }
        : '',
      'all-articles-container-id': 'all-articles-' + idx,
      'button': author.articles.length > 2 ?
        { 'all-articles-container-id-search': '#all-articles-' + idx }
        : ''
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