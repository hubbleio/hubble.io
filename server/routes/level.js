module.exports = function(conf, content, templates, articleRoutes, github, authenticated, respond) {

  return  {

    '/([\\w|\\s|-]+)': {

      get: respond(function(levelName) {
        var articles = content.index.byDifficultyLevel[levelName];
        if (! articles) {
          this.res.writeHead(404);
          this.res.end('Not found');
          return;
        }
        return templates('/level.html').call(this, levelName, articles);
      }),

      '/guides': articleRoutes(conf, content, templates, github, authenticated, respond, '/levels')
    }
  };

};
