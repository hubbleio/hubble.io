var githubAuth = require('../github_auth');

module.exports = function(conf, content, templates, github, respond) {

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
    '/:name/like': {
      post: respond(function(name) {
        findArticle.call(this, name, function(article) {
          github.like.call(this, article);
        });
      })
    },
    '/:name/fork': {
      post: respond(function(name) {
        findArticle.call(this, name, function(article) {
          github.fork.call(this, article);
        });
      })
    },
    '/:name/comment': {
      get: respond(function(name) {
        var res = this.res;
        var repo = findRepo.call(this, name);
        if (! repo) { return; }
        var discussion = this.req.query.discussion;
        return assets['discussions/new_comment.html'].compose(repo, discussion);
      }),
      post: respond(function(name) {
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
      get: respond(function(name) {
        return findArticle.call(this, name, templates('/article.html'));
      })
    }
  };
};