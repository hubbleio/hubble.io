var Templates       = require('../../lib/cascading_templates'),
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
  var templates = Templates(conf, content),
      github   = Github(conf),
      comments = Comments(conf);

  function authenticated(callback) {
    return function() {
      if (this.req.session && this.req.session.user) {
        return callback.apply(this, arguments);
      } else {
        if (this.req.method !== 'GET' || this.req.headers['x-requested-with'] === 'XMLHttpRequest') {
          this.res.writeHead(403);
          this.res.end('Forbidden');          
        } else {
          this.res.writeHead(303, {Location: '/auth/github?redir=' + encodeURIComponent(this.req.url)});
          this.res.end();
        }
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
        if (! this.res.finished) {
          try {
            this.res.writeHead(500, { 'Content-Type': 'text/html'});
          } catch(err2) {
            console.error(err2.stack);
          }
          
          this.res.end(templates('/error.html'));
        }
      }
    };
  }

  var articleRoutes = require('./article');

  var routes = {
    '/': {
      get: respond(function() {
        return templates('/index.html').call(this);
      })
    },
    '/contributors': require('./contributor')(conf, content, templates, respond),
    '/guides': articleRoutes(conf, content, templates, github, authenticated, respond),
    '/categories': require('./category')(conf, content, templates, github, authenticated, articleRoutes, respond),
    '/levels': require('./level')(conf, content, templates, articleRoutes, github, authenticated, respond),
    '/update/': {
      post: respond(function() {
        var that = this;
        postReceiveHook(this.req, content, function(composition) {
          that.res.writeHead(200, { 'Content-Type': 'text/html' });
          that.res.end(composition);
        });
      })
    },
    '/auth': require('./auth')(conf, respond),
    '/profile': require('./profile')(conf, authenticated, templates, github, respond),
    '/contact': require('./contact')(conf, authenticated, templates, respond)
  };

  return routes;
};