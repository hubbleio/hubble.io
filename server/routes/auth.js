var githubAuth = require('../github_auth');

module.exports = function(conf, respond) {
  return {
    '/logout': {
      get: respond(function() {
        githubAuth(conf.auth.github, this.req, this.res).logout();
      })
    },
    '/github/callback': {
      get: respond(function() {
        githubAuth(conf.auth.github, this.req, this.res).end();
      }),
      post: respond(function() {
        githubAuth(conf.auth.github, this.req, this.res).end();
      })
    },
    '/github': {
      get: respond(function() {
        githubAuth(conf.auth.github, this.req, this.res).begin();
      })
    }
  };
};