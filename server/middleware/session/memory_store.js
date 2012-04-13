function noop() {};
var debug = noop;

var ONE_HOUR = 60 * 60 * 1000;

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

function MemoryStore(timeout) {

  timeout || (timeout = ONE_HOUR);
  var store = {};
  var timeouts = {};

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
    store[id] = clone(value);
    process.nextTick(callback);
    timeouts[id] = setTimeout(function() {
      clear(id, function(err) {
        if (err) { console.error(err); }
      });
    }, timeout);
  }

  function get(id, callback) {
    debug('getting %s', id);
    var o = store[id];
    if (typeof o !== 'undefined') { o = clone(o); }
    process.nextTick(function() {
      callback(null, o);
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

module.exports = MemoryStore;