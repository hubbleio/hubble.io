var redis = require('redis');

function noop() {};
var debug = noop;
//var debug = console.log;

var ONE_HOUR = 60 * 60;
var DEFAULT_PREFIX = 'hubbleio-session-';

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

function RedisStore(options) {

  if (! options) {
    options = {};
  }

  options.timeout || (options.timeout = ONE_HOUR);
  var client = options.client || new redis.createClient(options.port, options.host);
  if (options.pass) {
    client.auth(options.pass, function(err) {
      if (err) { throw err; }
    });
  }

  if (! options.prefix) {
    options.prefix = DEFAULT_PREFIX;
  }

  function clear(id, callback) {
    var timeout = timeouts[id];
    if (timeout) {
      clearTimeout(timeout);
      delete timeouts[id];
    }
    delete store[id];
    process.nextTick(callback);
  }

  function set(id, value, callback) {
    debug('setting %s to %j', id, value);
    try {
      client.setex(options.prefix + id, options.timeout, JSON.stringify(value), callback);
    } catch(err) {
      return callback(err);
    }
  }

  function get(id, callback) {
    debug('getting %s', id);
    client.get(options.prefix + id, function(err, data) {
      if (err) { return callback(err); }
      if (! data) { return callback(); }
      data = data.toString();
      debug('got %s', data);
      try {
        data = JSON.parse(data);
      } catch(err) {
        return callback(err);
      }
      callback(null, data);
    });
  }

  return function store(id, value, callback) {
    if (typeof value == 'function') {
      callback = value;
      value = undefined;
    }

    if (value) {
      set(id, value, callback);
    } else {
      get(id, callback);
    }
  }
}

module.exports = RedisStore;