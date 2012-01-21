/*
 *
 * server.js
 * creates an http server and serves the static assets 
 * it also transforms some static content by adding data to it.
 *
 */

var director = require('director'),
    http = require('http'),
    static = require('node-static'),
    cluster = require('cluster'),
    Content = require('./content'),
    Github = require('./github'),
    postReceiveHook = require('./postreceivehook');

var server = exports;

server.createServer = function(conf, cb) {
   console.log(conf)
  //
  // define a routing table that will contain methods
  // for transforming static content or invoking services.
  //
  var router = new director.http.Router({
    '/index.html': {
      get: function() {
        this.res.writeHead(200, { 'Content-Type': 'text/html' });
        this.res.end(content.get('index.html'));
      }
    },
    '/:repo': {
      get: function(repo) {
        this.res.writeHead(200, { 'Content-Type': 'text/html' });
        this.res.end(content.get(repo + '/content.html'));
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
    }
  });

  //
  // create a static file server for any generic requests
  // that do not require any special treatments.
  //
  var file = new static.Server('./public/');

  //
  // stup a server and when there is a request, dispatch the
  // route that was requestd in the request object.
  //
  var server = http.createServer(function (req, res) {
    req.addListener('end', function () {
      router.dispatch(req, res);
      file.serve(req, res);
    });
  });

  server.listen(conf.port, conf.host);

};
