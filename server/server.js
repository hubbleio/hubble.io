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
    Templates = require('./templates'),
    Github = require('./github'),
    postrecievehook = require('./postrecievehook');

var server = exports;

server.createServer = function(conf) {

  //
  // create a new instance of the github API abstraction.
  //
  var github = new Github(conf);

  //
  // define a routing table that will contain methods
  // for transforming static content or invoking services.
  //
  var router = new director.http.Router({
    '/index': {
      get: function() {
        this.res.writeHead(200, { 'Content-Type': 'text/html' });
        this.res.end(templates.assets['index.html'].compiled);
      }
    },
    '/postrecievehook/:repo': {
      post: function(repo) {
        postrecievehook(this.req, github);
        this.res.end(templates.assets[repo].compiled);
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

  //
  // dont start the server until we actually have content to serve.
  //
  var templates = new Templates(conf, github, function(assets) {
    server.listen(conf.port, conf.host);
  });

};
