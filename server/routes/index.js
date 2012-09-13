var Templates       = require('../../lib/cascading_templates'),
    Comments        = require('../../lib/comments'),
    Github          = require('../../lib/github')
    ;

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

  var options = {
    conf:          conf,
    content:       content,
    templates:     templates,
    github:        github,
    authenticated: authenticated,
    respond:       respond,
    articleRoutes: articleRoutes
  };

  var routes = {
    '/': {
      get: respond(function() {
        return templates('/index.html').call(this);
      })
    },
    '/guides':     articleRoutes(options),
    '/authors':    require('./author')   (options),
    '/categories': require('./category') (options),
    '/levels':     require('./level')    (options),
    '/videos':     require('./videos')   (options),
    '/auth':       require('./auth')     (options),
    '/profile':    require('./profile')  (options),
    '/contact':    require('./contact')  (options),
    '/faq':        require('./faq')      (options),
    '/about':      require('./about')    (options)
  };

  return routes;
};