module.exports = function(conf, content, templates, respond) {

  return  {

    get: respond(function() {
      return templates('/author/index.html').call(this);
    }),

    '/([\\w|\\s|-|\.]+)': {

      get: respond(function(authorName) {
        var author = content.index.byAuthor[authorName];
        if (! author) {
          this.res.writeHead(404);
          this.res.end('Not found');
          return;
        }
        return templates('/author/index.html').call(this, author);
      })
    }
  };

};
