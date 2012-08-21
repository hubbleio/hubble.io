var githubAuth     = require('../github_auth'),
    Article        = require('../../lib/article'),
    ArticleRequest = require('../article_request'),
    ArticleSuggestion = require('../article_suggestion')
    ;

module.exports = function(conf, content, templates, github, authenticated, respond, prefix) {

  var articleRequest    = ArticleRequest(conf),
      articleSuggestion = ArticleSuggestion(conf)
      ;

  function findArticle(name, next) {
    var article = content.index.byName[name];
    if (! article) {
      this.res.writeHead(404);
      this.res.end('Not Found');
      return;
    }
    return next.call(this, article);
  }

  return {
    post: authenticated(function() {
      articleRequest.create.call(this, this.req.body);
    }),
    '/new': {
      get: respond(function(name) {
        return templates('/article/new.html').call(this);
      })
    },
    '/preview': {
      post: respond(function() {
        var self = this;
        var res = this.res;
        var postedArticle = this.req.body;
        var categories = [];
        if (postedArticle.category) {
          categories.push(postedArticle.category.split(' &gt; '));
        }

        github.markdownToMarkup(postedArticle.content, function(err, markup) {
          if (err) {
            res.writeHead(500);
            return res.end(err.stack);
          }

          var article = {
            meta: {
              categories: categories,
              authors: []
            },
            markup: markup
          };

          res.writeHead(200, {'Content-Type': 'text/html'});
          res.end(templates('/article/preview.html').call(self, article));

        });

      })
    },
    '/suggestion': {
      get: respond(function() {
        return templates('/article/request.html').call(this);
      }),
      post: respond(function() {
        articleSuggestion.call(this, this.req.body);
      })
    },
    '/:name/star': {
      post: respond(function(firstLevel, name) {
        if (! firstLevel) {
          name = firstLevel;
          firstLevel = undefined;
        }

        findArticle.call(this, name, function(article) {
          github.star.call(this, article);
        });
      })
    },
    '/:name/fork': {
      post: respond(function(firstLevel, name) {
        if (! firstLevel) {
          name = firstLevel;
          firstLevel = undefined;
        }

        findArticle.call(this, name, function(article) {
          github.fork.call(this, article);
        });
      })
    },
    '/:name/comment': {
      get: respond(function(cat, name) {
        if (! prefix) {
          name = cat;
          cat = undefined;
        }

        var res = this.res;
        var repo = findRepo.call(this, name);
        if (! repo) { return; }
        var discussion = this.req.query.discussion;
        return assets['discussions/new_comment.html'].compose(repo, discussion);
      }),
      post: respond(function(cat, name) {
        if (! prefix) {
          name = cat;
          cat = undefined;
        }

        var res  = this.res,
            body = this.req.body,
            repo = findRepo.call(this, name);

        if (! repo) { return; }

        function done(err) {
          if (err) {
            res.writeHead(500);
            return res.end(err.message);
          }
          content.downloadComments(repo, function(err) {
            content.composeRepo(assets, repo);
            res.end();
          });
        }
        
        if (! body.discussion) {
          comments.create.call(this, repo, done);
        } else {
          comments.reply.call(this, repo, body.discussion, body.body, done);
        }
      })
    },
    '/:name': {
      get: respond(function(firstLevel, name) {
        var res = this.res;
        if (! prefix) {
          name = firstLevel;
          firstLevel = undefined;
          findArticle.call(this, name, function(article) {
            if (article.meta.categories.length) {
              var cat = article.meta.categories[0];
              cat = content.index.searchCategory(cat);
              var url = '/categories/' + cat.id + '/guides/' + encodeURIComponent(article.name);
              res.writeHead(301, {Location: url});
              res.end();
              return;
            }
          });
        }
        findArticle.call(this, name, function(article) {
          var cat, level;
          var prefixURL = prefix + '/';
          if (prefix === '/categories') {
            cat = content.index.searchCategory(firstLevel);
            prefixURL += encodeURIComponent(cat.id);
          } else if (prefix === '/levels' ) {
            level = firstLevel;
            prefixURL += encodeURIComponent(level);
          }
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.end(templates('/article/index.html').call(this, article, prefixURL, cat, level));
        });
      })
    }
  };
};