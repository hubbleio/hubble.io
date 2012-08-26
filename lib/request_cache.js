var request = require('request'),
    fs      = require('fs'),
    path    = require('path'),
    Moment  = require('./moment'),
    crypto  = require('crypto')
    ;

function generateHash(options, data) {
  var shasum = crypto.createHash('sha1');
  Object.keys(options).forEach(function(key) {
    shasum.update(JSON.stringify(options[key]));
  });
  
  return shasum.digest('hex');
}

var DEFAULT_TTL = 3600 * 1000; // 1 hour

module.exports = function(dir, ttl) {

  if (! ttl) {
    ttl = DEFAULT_TTL;
  }
  
  function doRequest(originalOptions, data, callback) {

    var args = arguments;

    if (typeof data === 'function') {
      callback = data;
      data = undefined;
    }

    var options = originalOptions;
    if (typeof options !== 'object') {
      options = {
        uri: options
      };
    }
    if (! options.method) {
      options.method = 'GET';
    }

    var hash = generateHash(options, data);

    var url = encodeURIComponent(options.url || options.uri || options);
    var fileName = path.join(dir, options.method + '_' + url + '_' + hash);
    var cache = {
      head: fileName + '.head',
      body: fileName + '.body'
    };

    function fallback() {
      var req = request.apply({}, args);
      
      req.on('response', function(resp) {

        resp.setEncoding('utf8');

        if (resp.statusCode < 200 || resp.statusCode >= 299) {
          return callback(null, resp);
        }

        if (! resp.headers.expires) {
          resp.headers.expires = Date.now() + ttl;
        }
        resp.headers.statusCode = resp.statusCode;

        var ws = fs.createWriteStream(cache.body, { encoding: 'utf8'});
        resp.pipe(ws);
        
        fs.writeFile(cache.head, JSON.stringify(resp.headers), 'utf8', function(err) {

          if (err) { return callback(err); }

        });

        var body = '';
        resp.on('data', function(d) {
          body += d;
        });
        resp.on('end', function() {
          callback(null, resp, body);
        });

      });
    }

    fs.exists(cache.head, function(exists) {
      
      if (exists) {
        fs.readFile(cache.head, 'utf8', function(err, headers) {
          
          if (err) { return callback(err); }

          //
          // get the expires header, parse it and check if content has expired
          //
          headers = JSON.parse(headers);
          var statusCode = headers.statusCode;
          delete headers.statusCode;
          var expires = Moment(headers.expires).unix() * 1000;
          if (expires < Date.now()) {
            return fallback();
          }

          fs.readFile(cache.body, options.encoding || 'utf8', function(err, body) {
            if (err) { return callback(err); }

            callback(null, {headers: headers, statusCode: statusCode}, body);
          });
          
        });
      } else {
        fallback();
      }
    });

  }

  doRequest.get = doRequest;
  doRequest.put = function(options) {
    if (typeof options !== 'object') {
      options = {
        uri: options
      };
    }
    arguments[0] = options;
    options.method = 'PUT';

    doRequest.apply(this, arguments);
  };

  doRequest.post = function(options) {
    if (typeof options !== 'object') {
      options = {
        uri: options
      };
    }
    arguments[0] = options;
    options.method = 'POST';

    doRequest.apply(this, arguments);
  };

  return doRequest;
};