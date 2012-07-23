module.exports = function(html, templates, conf, bind, map, content) {

  var popularGuides = content.index.byPopularity.slice(0, 2);
  var newGuides = content.index.byCreationDate.slice(0, 2);

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
    var data = {
      'sign-in-with-github': (! this.req.session.user && templates('/user/sign_in_big_button.html')()) || '',
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

    var main = bind(html, data);
    return templates('/layout.html').call(this, {
      main: main,
      title: 'Home',
      orgname: conf.title
    });
  };
};