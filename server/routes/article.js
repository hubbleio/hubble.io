var githubAuth     = require('../github_auth'),
    Article        = require('../../lib/article'),
    ArticleRequest = require('../article_request'),
    ArticleSuggestion = require('../article_suggestion')
    ;

module.exports = function(options, prefix) {

  var articleRequest    = ArticleRequest(options.conf),
      articleSuggestion = ArticleSuggestion(options.conf)
      ;

  function findArticle(name, next) {
    var article = options.content.index.byName[name];
    if (! article) {
      this.res.writeHead(404);
      this.res.end('Not Found');
      return;
    }
    return next.call(this, article);
  }

  return {
    post: options.authenticated(function() {
      articleRequest.create.call(this, this.req.body);
    }),

    '/new': {
      get: options.respond(function(name) {
        return options.templates('/article/new.html').call(this);
      })
    },

    '/preview': {
      post: options.respond(function() {
        var self = this;
        var res = this.res;
        var postedArticle = this.req.body;
        var categories = [];
        if (postedArticle.category) {
          categories.push(postedArticle.category.split(' &gt; '));
        }

        options.github.markdownToMarkup(postedArticle.content, function(err, markup) {
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
          res.end(options.templates('/article/preview.html').call(self, article));

        });

      })
    },

    '/suggestion': {
      get: options.respond(function() {
        return options.templates('/article/request.html').call(this);
      }),
      post: options.respond(function() {
        articleSuggestion.call(this, this.req.body);
      })
    },

    '/:name/star': {
      post: options.respond(function(firstLevel, name) {
        if (! name) {
          name = firstLevel;
          firstLevel = undefined;
        }

        findArticle.call(this, name, function(article) {
          options.github.star.call(this, article);
        });
      })
    },

    '/:name/fork': {
      post: options.respond(function(firstLevel, name) {
        if (! firstLevel) {
          name = firstLevel;
          firstLevel = undefined;
        }

        findArticle.call(this, name, function(article) {
          options.github.fork.call(this, article);
        });
      })
    },

    '/:name/comment': {
      get: options.respond(function(cat, name) {
        if (! prefix) {
          name = cat;
          cat = undefined;
        }

        var res = this.res;
        var repo = findRepo.call(this, name);
        if (! repo) return;
        var discussion = this.req.query.discussion;
        return assets['discussions/new_comment.html'].compose(repo, discussion);
      }),
      post: options.respond(function(cat, name) {
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
          options.content.downloadComments(repo, function(err) {
            options.content.composeRepo(assets, repo);
            res.end();
          });
        }
      })
    },

    '/:name': {
      get: options.respond(function(firstLevel, name) {
        var res = this.res;
        if (! prefix) {
          name = firstLevel;
          firstLevel = undefined;
          findArticle.call(this, name, function(article) {
            if (article.meta.categories.length) {
              var cat = article.meta.categories[0];
              cat = options.content.index.searchCategory(cat);
              var url = '/categories/' + cat.id + '/guides/' + encodeURIComponent(article.name);
              res.writeHead(301, {Location: url});
              res.end();
            }
          });
        } else {
          findArticle.call(this, name, function(article) {
            var cat, level;
            var prefixURL = prefix + '/';
            if (prefix === '/categories') {
              cat = options.content.index.searchCategory(firstLevel);
              prefixURL += encodeURIComponent(cat.id);
            } else if (prefix === '/levels' ) {
              level = firstLevel;
              prefixURL += encodeURIComponent(level);
            }
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(options.templates('/article/index.html').call(this, article, prefixURL, cat, level));
          });
        }
      })
    }
  };
};