var request = require('request'),
    url     = require('url'),
    qs      = require('querystring');

var escape = encodeURIComponent;

var GITHUB_OAUTH_URI_BASE = 'https://github.com/login/oauth';
var GITHUB_API_URI_BASE = 'https://api.github.com';

function buildURI() {
  var args = [];
  for(var i = 1; i < arguments.length; i += 2) {
    var arg = escape(arguments[i]) + '=' + escape(arguments[i + 1]);
    args.push(arg);
  }
  return arguments[0] + args.join('&');
}

function githubOauth(conf, req, res) {

  function begin() {
    var callbackURI = conf.callback_uri + '?redir=' + encodeURIComponent(req.query.redir || req.headers.referer);
    res.writeHead(302, {"Location": buildURI(
        GITHUB_OAUTH_URI_BASE + '/authorize?',
        'client_id', conf.client_id,
        'redirect_uri', callbackURI,
        'scope', 'public_repo'
    )});
    res.end();
  }

  function error(err) {
    console.error(err);
    res.writeHead(500);
    res.end(err.message);    
  }

  function end() {

    var code = url.parse(req.url, true).query.code;
    var uri = buildURI(
        GITHUB_OAUTH_URI_BASE + '/access_token?',
        'client_id', conf.client_id,
        'redirect_uri', conf.callback_uri,
        'client_secret', conf.secret,
        'code', code
    );
    request.post(uri, function(err, response, body) {
      if (err) { return error(err); }
      if (response.statusCode < 200 || response.statusCode >= 300) {
        return error(new Error('Github replied with status code ' + response.statusCode + ' to URL ' + uri));
      }

      console.log('response body form github: %s', body.toString());
      
      var accessToken = qs.parse(body).access_token;
      var uri = buildURI(GITHUB_API_URI_BASE + '/user?', 'access_token', accessToken);
      request.get(uri, function(err, response, body) {
        if (err) { return error(err); }
        if (response.statusCode < 200 || response.statusCode >= 300) {
          return error(new Error('Github replied with status code ' + response.statusCode + ' to URL ' + uri));
        }
        try { var user = JSON.parse(body); } catch (err) { return error(err); }
        req.session.user = user;
        req.session.github = {accessToken: accessToken};
        var redirURL = req.query && req.query.redir || '/';
        res.writeHead(302, {"Location": redirURL});
        res.end();
      });
    });
  }

  function logout() {
    req.session.clear();
    res.writeHead(302, {"Location": '/'});
    res.end();
  }

  return {
    begin: begin,
    end: end,
    logout: logout
  }

}

module.exports = githubOauth;