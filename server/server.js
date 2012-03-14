/*
 *
 * server.js
 * creates an http server and serves the static assets 
 * it also transforms some static content by adding data to it.
 *
 */

var director = require('director'),
    union    = require('union'),
    static = require('node-static'),
    cluster = require('cluster'),
    Content = require('./content'),
    postReceiveHook = require('./postreceivehook'),
    githubAuth = require('./auth/github'),
    personalize = require('./personalize'),
    Like = require('./like');

var server = exports;

server.createServer = function(content, conf) {

  var like = Like(conf);

  //
  // define a routing table that will contain methods
  // for transforming static content or invoking services.
  //
  var routes = {
    '/': {
      get: function() {
        this.res.writeHead(200, { 'Content-Type': 'text/html' });
        this.res.end(personalize.call(this, content.getIndex()));
      }      
    },
    '/index.html': {
      get: function() {
        this.res.writeHead(200, { 'Content-Type': 'text/html' });
        this.res.end(personalize.call(this, content.getIndex()));
      }
    },
    '/article/:name/like': {
      post: function(name) {
        var repo = content.getRepo(name);
        if (! repo) {
          this.res.setHeader(404);
          return this.res.end('Not Found');
        }
        like.call(this, repo);
      }
    },
    '/article/:name': {
      get: function(name) {
        this.res.writeHead(200, { 'Content-Type': 'text/html' });
        this.res.end(personalize.call(this, content.getArticle(name)));
      }
    },
    '/tags/:tag': {
      get: function(tag) {
        this.res.writeHead(200, { 'Content-Type': 'text/html' });
        this.res.end(personalize.call(this, content.getTag(tag)));
      }
    },
    '/categories/:category': {
      get: function(category) {
        this.res.writeHead(200, { 'Content-Type': 'text/html' });
        this.res.end(personalize.call(this, content.getCategory(category)));
      }
    },
    '/update/': {
      post: function() {
        var that = this;
        postReceiveHook(this.req, content, function(composition) {
          that.res.writeHead(200, { 'Content-Type': 'text/html' });
          that.res.end(composition);
        });
      }
    },
    '/auth/logout': {
      get: function() {
        githubAuth(conf.auth.github, this.req, this.res).logout();
      }
    },
    '/auth/github/callback': {
      get: function() {
        githubAuth(conf.auth.github, this.req, this.res).end();
      },
      post: function() {
        githubAuth(conf.auth.github, this.req, this.res).end();
      }
    },
    '/auth/github': {
      get: function() {
        githubAuth(conf.auth.github, this.req, this.res).begin();
      }
    }
  };

  var router = new director.http.Router(routes);

  //
  // create a static file server for any generic requests
  // that do not require any special treatments.
  //
  var file = new static.Server('./public/');

  //
  // stup a server and when there is a request, dispatch the
  // route that was requestd in the request object.
  //
  var server = union.createServer({
    before: [
      require('./middleware/favicon')(__dirname + '/../public/favicon.png'),
      require('./middleware/cookie_parser')(),
      require('./middleware/session')(),
      function (req, res) {
        var found = router.dispatch(req, res);
        if (! found) {
          file.serve(req, res);
          // res.emit('next');
        }
      },
    ]
  });

  console.log('[hubble] Starting http server on ', conf.host + ':' + conf.port);
  server.listen(conf.port, conf.host);

};
