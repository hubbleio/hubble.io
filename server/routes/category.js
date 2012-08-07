module.exports = function(conf, content, templates, respond) {

  return  {

    '/([\\w|\\s|-]+)': {

      get: respond(function(categoryName) {
        var categoryParts = categoryName.split('--'),
            children = content.index.byCategory,
            category
            ;

        console.log('category parts:', categoryParts);
        
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
        return templates('/category.html').call(this, category);
      })
    }
  };

};
