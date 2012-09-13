module.exports = function(options) {

  return  {

    get: options.respond(function() {
      return options.templates('/author/index.html').call(this);
    }),

    '/([\\w|\\s|-|\.]+)': {

      get: options.respond(function(authorName) {
        var author = options.content.index.byAuthor[authorName];
        if (! author) {
          this.res.writeHead(404);
          this.res.end('Not found');
          return;
        }
        return options.templates('/author/show.html').call(this, author);
      })
    }
  };

};
