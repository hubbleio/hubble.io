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
    postReceiveHook = require('./postreceivehook');

var server = exports;

function getArticle(name) {
  this.res.writeHead(200, { 'Content-Type': 'text/html' });
  this.res.end(content.getArticle(name));
}

function getIndex() {
  this.res.writeHead(200, { 'Content-Type': 'text/html' });
  this.res.end(content.getIndex());
}

function postReeive() {
  var that = this;
  postReceiveHook(this.req, content, function(composition) {
    that.res.writeHead(200, { 'Content-Type': 'text/html' });
    that.res.end(composition);
  });
}

server.createServer = function(conf, cb) {

  //
  // define a routing table that will contain methods
  // for transforming static content or invoking services.
  //
  var routes = {
    '/index.html': {
      on: getIndex
    },
    '/:name': {
      on: getArticle
    },
    '/update/': {
      post: postReceive
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
  var server = http.createServer(function (req, res) {
    req.addListener('end', function () {
      router.dispatch(req, res);
      file.serve(req, res);
    });
  });

  server.listen(conf.port, conf.host);

};
