/*
 *
 * server.js
 * creates an http server and serves the static assets
 * it also transforms some static content by adding data to it.
 *
 */

var director = require('director'),
    union    = require('union'),
    nstatic = require('node-static');

var server = exports;

server.createServer = function(conf, content, callback) {

  //
  // define a routing table that will contain methods
  // for transforming static content or invoking services.
  //

  var router = new director.http.Router(require('./routes')(conf, content));

  //
  // create a static file server for any generic requests
  // that do not require any special treatments.
  //
  

  //
  // Initialize store
  //
  var store;

  if (conf.session && conf.session.store === 'redis') {
    store = require('./middleware/session/redis_store')(conf.session.options);
  }

  var file = (function handleStatic() {
    var file = new nstatic.Server(__dirname + '/public/');
    if (conf.override && conf.override['static']) {
      var overrideFile = new nstatic.Server(conf.override['static']);
      return function(req, res) {
        overrideFile.serve(req, res, function(err) {
          if (err && err.status === 404) {
            file.serve(req, res);
          }
        });
      };
    } else {
      return function(req, res) {
        file.serve(req, res);
      };
    }
  }());

  //
  // stup a server and when there is a request, dispatch the
  // route that was requestd in the request object.
  //
  var server = union.createServer({
    before: [
      require('./middleware/favicon')(__dirname + '/../public/favicon.png'),
      require('./middleware/cookie_parser')(),
      require('./middleware/session')('sid', store),
      function (req, res) {
        req.url = req.url.replace(/%25/g, '%').replace(/%20/g, ' ');
        var found = router.dispatch(req, res);
        if (! found) {
          file(req, res);
        }
      }
    ]
  });

  console.log('[hubble] Starting http server on ', conf.host + ':' + conf.port);
  server.listen(conf.port, conf.host, callback);

  return server;

};
