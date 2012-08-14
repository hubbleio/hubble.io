var defaultOptions = {
  "port": 8080,
  "host": "*",
  "db": {
    "url": "http://localhost:5984"
  },
  "download": true
};

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

function mixin(a, b) {
  if ('object' !== typeof b) { return; }
  if ('undefined' === typeof a) { throw new Error('first argument of mixin is undefined'); }
  Object.keys(b).forEach(function(key) {
    var inA = a[key];
    if (! inA) {
      a[key] = clone(b[key]);
    } else {
      a[key] = mixin(a[key], b[key]);
    }
  });
  return a;
}

var requiredFields = [
  ['port'],
  ['orgname'],
  ['tagline'],
  ['description'],
  ['content', 'home', 'beginner'],
  ['content', 'home', 'intermediate'],
  ['content', 'home', 'expert'],
  ['auth', 'github', 'callback_uri'],
  ['auth', 'github', 'client_id'],
  ['auth', 'github', 'secret'],
  ['db', 'url'],
  ['auth', 'github', 'secret'],
  ['email', 'sendgrid', 'user'],
  ['email', 'sendgrid', 'key'],
  ['email', 'to'],
  ['email', 'from']
];

function validate(options) {
  requiredFields.forEach(function(fieldPath) {
    var accumulatedPaths = [];
    var node = options;
    
    fieldPath.forEach(function(field) {
      accumulatedPaths.push(field);
      node = node[field];
      if ('undefined' === typeof node) {
        throw new Error('Options must contain key ' + accumulatedPaths.join('.'));
      }
    });
  });
}

function options(userOptions) {
  if (! userOptions) { userOptions = {}; }
  var options = clone(defaultOptions);
  options = mixin(options, userOptions);
  validate(options);
  return options;
}

module.exports = options;