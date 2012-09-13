module.exports = function(options) {

  return  {

    '/([\\w|\\s|-]+)': {

      get: options.respond(function(levelName) {
        var articles = options.content.index.byDifficultyLevel[levelName];
        if (! articles) {
          this.res.writeHead(404);
          this.res.end('Not found');
          return;
        }
        return options.templates('/level.html').call(this, levelName, articles);
      }),

      '/guides': options.articleRoutes(options, '/levels')
    }
  };

};
