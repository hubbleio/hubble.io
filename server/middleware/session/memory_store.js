var debug = console.log;

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

function MemoryStore() {
  var store = {};

  function set(id, value, callback) {
    debug('setting %s to %j', id, value);
    store[id] = clone(value);
    process.nextTick(callback);
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