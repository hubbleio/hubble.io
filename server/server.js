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
    Github = require('./github');
    Comments = require('./comments');

var server = exports;

server.createServer = function(assets, content, conf) {

  var github   = Github(conf),
      comments = Comments(conf);

  function findRepo(name) {
    var repo = content.getRepo(name);
    if (! repo) {
      this.res.setHeader(404);
      this.res.end('Not Found');
      return false
    }
    return repo
  }

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
        var repo = findRepo.call(this, name);
        if (! repo) { return; }
        github.like.call(this, repo);
      }
    },
    '/article/:name/fork': {
      post: function(name) {
        var repo = findRepo.call(this, name);
        if (! repo) { return; }
        github.fork.call(this, repo);
      }
    },
    '/article/:name/comment': {
      get: function(name) {
        var res = this.res;
        var repo = findRepo.call(this, name);
        if (! repo) { return; }
        var discussion = this.req.query.discussion;
        this.res.writeHead(200, { 'Content-Type': 'text/html' });
        this.res.end(assets['discussions/new_comment.html'].compose(repo, discussion));
      },
      post: function(name) {
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
    '/categories/([\\w|\\s|-]+)': {
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
        req.url = req.url.replace(/%25/g, '%').replace(/%20/g, ' ');
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
