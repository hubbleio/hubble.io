
/*!
 * Connect - cookieParser
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */


/**
 * Parse signed cookies, returning an object
 * containing the decoded key/value pairs,
 * while removing the signed key from `obj`.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

exports.parseSignedCookies = function(obj, secret){
  var ret = {};
  Object.keys(obj).forEach(function(key){
    var val = obj[key]
      , signed = exports.unsign(val, secret);

    if (signed) {
      ret[key] = signed;
      delete obj[key];
    }
  });
  return ret;
};

/**
 * Parse JSON cookies.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

exports.parseJSONCookies = function(obj){
  var hashes = {};

  Object.keys(obj).forEach(function(key){
    var val = obj[key];
    if (0 == val.indexOf('j:')) {
      try {
        hashes[key] = crc16(val); // only crc json cookies for now
        obj[key] = JSON.parse(val.slice(2));
      } catch (err) {
        // nothing
      }
    }
  });

  return {
    cookies: obj,
    hashes: hashes
  };
};

/**
 * Parse the given cookie string into an object.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

exports.parseCookie = function(str){
  var obj = {}
    , pairs = str.split(/[;,] */);
  for (var i = 0, len = pairs.length; i < len; ++i) {
    var pair = pairs[i]
      , eqlIndex = pair.indexOf('=')
      , key = pair.substr(0, eqlIndex).trim()
      , val = pair.substr(++eqlIndex, pair.length).trim();

    // quoted values
    if ('"' == val[0]) val = val.slice(1, -1);

    // only assign once
    if (undefined == obj[key]) {
      val = val.replace(/\+/g, ' ');
      try {
        obj[key] = decodeURIComponent(val);
      } catch (err) {
        if (err instanceof URIError) {
          obj[key] = val;
        } else {
          throw err;
        }
      }
    }
  }
  return obj;
};

/**
 * Cookie parser:
 *
 * Parse _Cookie_ header and populate `req.cookies`
 * with an object keyed by the cookie names. Optionally
 * you may enabled signed cookie support by passing
 * a `secret` string, which assigns `req.secret` so
 * it may be used by other middleware such as `session()`.
 *
 * Examples:
 *
 *     connect()
 *       .use(connect.cookieParser('keyboard cat'))
 *       .use(function(req, res, next){
 *         res.end(JSON.stringify(req.cookies));
 *       })
 *
 * @param {String} secret
 * @return {Function}
 * @api public
 */

module.exports = function cookieParser(secret){
  return function cookieParser(req, res, next) {
    var cookie = req.headers.cookie;
    if (req.cookies) return next();

    req.secret = secret;
    req.cookies = {};
    req.signedCookies = {};
    
    if (cookie) {
      try {
        req.cookies = parseCookie(cookie);
        if (secret) {
          req.signedCookies = parseSignedCookies(req.cookies, secret);
          var obj = parseJSONCookies(req.signedCookies);
          req.signedCookies = obj.cookies;
          req.cookieHashes = obj.hashes;
        }
        req.cookies = parseJSONCookies(req.cookies);
      } catch (err) {
        return next(err);
      }
    }
    next();
  };
};