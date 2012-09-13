var bubble = require('bubble');

module.exports = function(options) {

  return {
    
    '/:id': {
      get: options.authenticated(function(articleRequestId) {
        var self = this;
        var res = this.res;

        var b = bubble(function(err) {
          if (err) {
            console.error(err);
            res.writeHead(500);
            return res.end(err.stack);
          }
          var article = {
            meta: {
              categories: [],
              authors: []
            },
            markup: markup
          };

          res.writeHead(200, {'Content-Type': 'text/html'});
          res.end(templates('/article/preview.html').call(self, article));

        });

        articleRequest.get(articleRequestId, b(function(articleRequest) {
          options.github.markdownToMarkup(articleRequest.content, b());
        }));

      })
    }
    
  };
};