var moment = require('../../lib/moment'),
    crypto = require('crypto')
;

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

  map.className('author-avatar').to('author-avatar');
  map.className('avatar').to('author-avatar-url').as('src');
  map.className('author-link').to('author-link-to').as('href');

  map.className('article').to('article');
  map.className('article-title').to('article-title');
  map.className('article-title').use('article-url').as('href');
  map.className('author').to('author');
  map.className('author-name').to('author-name');
  map.className('author-name').use('author-url').as('href');
  map.className('published-when').use('published-when');
  map.className('article-intro').use('article-intro');

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

  function prepareArticle(article) {

    return {
      'article-title': article.meta.title,
      'article-url': '/guides/' + encodeURIComponent(article.name),
      'author': article.meta.authors.map(function(author) {
        return {
          'author-name': author.meta.name,
          'author-url': '/authors/' + encodeURIComponent(author.meta.name)
        };
      }),
      'published-when': moment(article.github.updated_at).fromNow(),
      'article-intro': article.meta.description
    };
  }

  return function() {

    var popularGuides = content.index.byPopularity.slice(0, 2);
    var newGuides = content.index.byCreationDate.slice(0, 2);

    //
    // Sort authors by number of articles
    //
      var authorList = Object.keys(content.index.byAuthor).map(function(authorName) {
        return content.index.byAuthor[authorName];
      }).sort(function(a, b) {
        return b.articles.length - a.articles.length;
      }).map(function(author) {

        var avatarURL;

        if (author.meta.email) {
          var emailHash = crypto.createHash('md5').update(author.meta.email.toLowerCase()).digest('hex');
          avatarURL = '//www.gravatar.com/avatar/' + encodeURIComponent(emailHash);
        }
        if (! avatarURL) {
          if (author.meta.github_info && author.meta.github_info.avatar_url) {
            avatarURL = author.meta.github_info.avatar_url;
          }
        }
        if (! avatarURL) {
          avatarURL = '/img/no_avatar.jpg';
        }

        return {
          'author-link-to': '/authors/' + encodeURIComponent(author.meta.name),
          'author-avatar-url': avatarURL
        };
      });


    var data = {
      'sign-in-with-github': (! this.req.session.user && {
        title: conf.title
      }) || '',
      'guides-popular': {article: popularGuides.map(prepareArticle)},
      'guides-new':     {article: newGuides.map(prepareArticle)},
      'beginner-intro': conf.content.home.beginner,
      'beginner-some-articles': someArticles('beginner'),
      'intermediate-intro': conf.content.home.intermediate,
      'intermediate-some-articles': someArticles('intermediate'),
      'expert-intro': conf.content.home.expert,
      'expert-some-articles': someArticles('expert'),
      'author-avatar': authorList
    };

    return templates('/layout.html').call(this, {
      main: bind(html, data, map),
      title: 'Home'
    });
  };
};