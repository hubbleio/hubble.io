ArticleRequest = require('../article_request');

module.exports = function(options) {

  var articleRequest = ArticleRequest(options.conf);

  return {

    get: options.authenticated(function() {
      var self = this;
      var res = this.res;
      articleRequest.getAllForUser(this.req.session.user, function(err, articleRequests) {
        if (err) {
          articleRequests = [];
          if(err.message !== 'missing') {
            console.error(err);
            res.writeHead(500);
            return res.end(err.stack);
          }
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(options.templates('/profile.html').call(self, articleRequests));
      });
    }),

    '/article-requests': require('./article_request')(options, articleRequest)
  };
};