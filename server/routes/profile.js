ArticleRequest = require('../article_request');

module.exports = function(conf, authenticated, templates, github, respond) {

  var articleRequest = ArticleRequest(conf);

  return {
    
    get: authenticated(function() {
      var self = this;
      var res = this.res;
      articleRequest.getAllForUser(this.req.session.user, function(err, articleRequests) {
        if (err) {
          console.error(err);
          res.writeHead(500);
          return res.end(err.stack);
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(templates('/profile/index.html').call(self, articleRequests));
      });
    }),

    '/article-requests': require('./article_request')(conf, authenticated, templates, articleRequest, github, respond)
  };
};