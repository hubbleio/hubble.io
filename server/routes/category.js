module.exports = function(conf, content, templates, respond) {

  return  {

    '/([\\w|\\s|-]+)': {

      get: respond(function(categoryName) {
        var category = content.index.byCategory[categoryName];
        if (! category) {
          this.res.writeHead(404);
          this.res.end('Not found');
          return;
        }
        return templates('/category.html').call(this, categoryName, category);
      })
    }
  };

};
