var Templates       = require('../../lib/templates'),
    Comments        = require('../../lib/comments'),
    Github          = require('../../lib/github')
    ;

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

module.exports = function(conf, content) {
  var templates = Templates(conf, __dirname + '/../templates', content),
      github   = Github(conf),
      comments = Comments(conf);

  function authenticated(callback) {
    return function() {
      if (this.req.session && this.req.session.user) {
        return callback.apply(this, arguments);
      } else {
        this.res.writeHead(403);
        this.res.end('Forbidden');
      }
    };
  }

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
        return templates('/index.html').call(this);
      })
    },
    '/contributors': {
      get: respond(function() {
        return templates('/contributors.html').call(this);
      })
    },
    '/articles': require('./article')(conf, content, templates, github, authenticated, respond),
    '/tags/:tag': {
      get: respond(function(tag) {
        return personalize.call(this, content.getTag(tag));
      })
    },
    '/categories': require('./category')(conf, content, templates, respond),
    '/update/': {
      post: respond(function() {
        var that = this;
        postReceiveHook(this.req, content, function(composition) {
          that.res.writeHead(200, { 'Content-Type': 'text/html' });
          that.res.end(composition);
        });
      })
    },
    '/auth': require('./auth')(conf, respond)
  };

  return routes;
};