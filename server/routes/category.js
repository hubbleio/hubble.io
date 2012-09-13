module.exports = function(options) {

  return  {

    '/([\\w|\\s|-]+)': {

      get: options.respond(function(categoryName) {
        var categoryParts = categoryName.split('--'),
            children = options.content.index.byCategory,
            category
            ;

        while (categoryParts.length) {
          var part = categoryParts.splice(0, 1)[0];
          category = children[part];
          if (category) {
            children = category.children;
          }
        }
        if (! category) {
          this.res.writeHead(404);
          this.res.end('Not found');
          return;
        }
        return options.templates('/category/index.html').call(this, category);
      }),

      '/guides': options.articleRoutes(options, '/categories')
    }
  };

};
