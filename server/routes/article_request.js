module.exports = function(conf, authenticated, templates, articleRequest, github, respond) {

  return {
    
    '/:id': {
      get: authenticated(function(articleRequestId) {
        var self = this;
        var res = this.res;
        articleRequest.get(articleRequestId, function(err, articleRequest) {
          if (err) {
            console.error(err);
            res.writeHead(500);
            return res.end(err.stack);
          }

          github.markdownToMarkup(articleRequest.content, function(err, markup) {
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

        });
      })
    }
    
  };
};