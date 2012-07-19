var Templates       = require('../../lib/templates'),
    Comments        = require('../comments'),
    Github          = require('../github');

    /*
    personalize     = require('../personalize');
    postReceiveHook = require('./postreceivehook'),
    githubAuth      = require('./auth/github'),
    */


function findRepo(name) {
  var repo = content.getRepo(name);
  if (! repo) {
    this.res.writeHead(404);
    this.res.end('Not Found');
    return false;
  }
  return repo;
}

module.exports = function(conf) {
  var templates = Templates(conf, __dirname + '/../templates'),
      github   = Github(conf),
      comments = Comments(conf);

  function respond(end) {
    return function() {
      try {
        var resp = end.apply(this, arguments);
        if (resp) {
          this.res.writeHead(200, { 'Content-Type': 'text/html' });
          this.res.end(resp);
        }
      } catch(err) {
        console.error(err.stack);
        this.res.writeHead(500, { 'Content-Type': 'text/html'});
        this.res.end(templates('/error.html'));
      }
    };
  }

  var routes = {
    '/': {
      get: respond(function() {
        return templates('/index.html')();
      })
    },
    '/index.html': {
      get: respond(function() {
        return personalize.call(this, content.getIndex());
      })
    },
    '/article/:name/like': {
      post: respond(function(name) {
        var repo = findRepo.call(this, name);
        if (! repo) { return; }
        github.like.call(this, repo);
      })
    },
    '/article/:name/fork': {
      post: respond(function(name) {
        var repo = findRepo.call(this, name);
        if (! repo) { return; }
        github.fork.call(this, repo);
      })
    },
    '/article/:name/comment': {
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
    '/article/:name': {
      get: respond(function(name) {
        return personalize.call(this, content.getArticle(name));
      })
    },
    '/tags/:tag': {
      get: respond(function(tag) {
        return personalize.call(this, content.getTag(tag));
      })
    },
    '/categories/([\\w|\\s|-]+)': {
      get: respond(function(category) {
        return personalize.call(this, content.getCategory(category));
      })
    },
    '/update/': {
      post: respond(function() {
        var that = this;
        postReceiveHook(this.req, content, function(composition) {
          that.res.writeHead(200, { 'Content-Type': 'text/html' });
          that.res.end(composition);
        });
      })
    },
    '/auth/logout': {
      get: respond(function() {
        githubAuth(conf.auth.github, this.req, this.res).logout();
      })
    },
    '/auth/github/callback': {
      get: respond(function() {
        githubAuth(conf.auth.github, this.req, this.res).end();
      }),
      post: respond(function() {
        githubAuth(conf.auth.github, this.req, this.res).end();
      })
    },
    '/auth/github': {
      get: respond(function() {
        githubAuth(conf.auth.github, this.req, this.res).begin();
      })
    }
  };

  return routes;
};