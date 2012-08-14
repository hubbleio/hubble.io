var Options = require('./lib/options'),
    server  = require('./server/server'),
    EE      = require('events').EventEmitter;

function create(options) {

  var ee = new EE();

  options = Options(options);
  
  function start(callback) {
    ee.emit('beforeload');
    Content(options, options.download, function(err, content) {
      if (err) { return ee.emit('error', err); }
      ee.emit('afterload');
      ee.emit('beforelisten');
      server.createServer(options, content, function() {
        ee.emit('afterlisten');
        if (callback) { callback(); }
      });
    });
  }

  ee.start = start;

  return ee;
}

module.exports = create;