module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();
  map.where('id').is('sign-in-with-github').use('sign-in-with-github');
  map.className('title').to('title');
  map.where('id').is('guides-popular').use('guides-popular');
  map.where('id').is('guides-new').use('guides-new');
  map.where('id').is('beginner-intro').use('beginner-intro');
  map.where('id').is('beginner-some-articles').use('beginner-some-articles');
  map.where('id').is('intermediate-intro').use('intermediate-intro');
  map.where('id').is('intermediate-some-articles').use('intermediate-some-articles');
  map.where('id').is('expert-intro').use('expert-intro');
  map.where('id').is('expert-some-articles').use('expert-some-articles');
  map.where('id').is('contributor-list').use('contributor-list');

  function someArticles(level) {
    var idx = 0,
        ret = '',
        articles = content.index.byDifficultyLevel[level],
        article;
    
    while(ret.length < 50 && idx < articles.length) {
      article = articles[idx];
      if (article.meta) {
        if (idx > 0) {
          ret += ', ';
        }
        ret += article.meta.title;
        idx ++;
      }
    }
    return ret;
  }

  return function() {

    var popularGuides = content.index.byPopularity.slice(0, 2);
    var newGuides = content.index.byCreationDate.slice(0, 2);

    var data = {
      'sign-in-with-github': (! this.req.session.user && {
        title: conf.title
      }) || '',
      'guides-popular': templates('/article/list.html')('Popular guides', popularGuides),
      'guides-new':     templates('/article/list.html')('New guides', newGuides),
      'beginner-intro': conf.content.home.beginner,
      'beginner-some-articles': someArticles('beginner'),
      'intermediate-intro': conf.content.home.intermediate,
      'intermediate-some-articles': someArticles('intermediate'),
      'expert-intro': conf.content.home.expert,
      'expert-some-articles': someArticles('expert'),
      'contributor-list': templates('/author/list.html').call(this)
    };

    return templates('/layout.html').call(this, {
      main: bind(html, data, map),
      title: 'Home'
    });
  };
};