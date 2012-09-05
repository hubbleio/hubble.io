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
    store[id] = clone(value);
    process.nextTick(callback);
    if (timeouts[id]) {
      clearTimeout(timeouts[id]);
    }
    timeouts[id] = setTimeout(function() {
      clear(id, function(err) {
        if (err) { console.error(err); }
      });
    }, timeout);
  }

  function get(id, callback) {
    var o = store[id];
    if (typeof o !== 'undefined') { o = clone(o); }
    process.nextTick(function() {
      callback(null, o);
    });
  }

  function doStore(id, value, callback) {
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

  doStore.close = function close() {
    Object.keys(timeouts).forEach(function(sid) {
      clearTimeout(timeouts[sid]);
    });
  };

  return doStore;
}

module.exports = MemoryStore;