var Options = require('./lib/options'),
    Server  = require('./server/server'),
    Content = require('./lib/content'),
    EE      = require('events').EventEmitter;

function create(options) {

  var ee = new EE(),
      server;

  options = Options(options);
  
  function start(callback) {
    ee.emit('beforeload');
    Content(options, options.download, function(err, content) {
      if (err) { return ee.emit('error', err); }
      ee.emit('loaded');
      ee.emit('beforelisten');
      server = Server.createServer(options, content, function() {
        ee.emit('listening');
        if (callback) { callback(); }
      });
    });
  }

  function stop(cb) {
    server.close(cb);
  }

  ee.start = start;
  ee.stop = stop;

  return ee;
}

module.exports = create;