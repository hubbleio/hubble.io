function Index(articles) {

  function indexByName() {
    var index = {};
    articles.forEach(function(article) {
      index[article.name] = article;
    });
    return index;
  }

  function indexByCategory() {
    var index = {
      name: 'root',
      articles: [],
      children: {}
    };
    articles.forEach(function(article) {
      if (article.name === 'index') { return; }
      if (article.meta && article.meta.categories) {
        article.meta.categories.forEach(function(cats) {
          if (! Array.isArray(cats)) { cats = [cats]; }
          cats.forEach(function(catPath) {
            if (! Array.isArray(catPath)) { catPath = [catPath]; }
            var parentCat = index;
            catPath.forEach(function(cat) {
              if (! parentCat.children[cat]) {
                parentCat.children[cat] = {
                  name: cat,
                  children: {},
                  articles: []
                };
              }
              parentCat = parentCat.children[cat];
              parentCat.articles.push(article);
            });
          });
        });
      }
    });

    return ret;
  }

  function indexByAuthor() {
    
  }

  function sortByPopularity() {
    return articles.sort(function(a, b) {
      return (a.github && a.github.watchers || 0) - (b.github && b.github.watchers || 0);
    });
  }

  function sortByCreationDate() {
    return articles.sort(function(a, b) {
      return (a.github && Date.parse(a.github.created_at) || 0) - (a.github && Date.parse(a.github.created_at) || 0);
    });
  }

  var ret = {
    byName: indexByName(),
    byCategory: indexByCategory(),
    byAuthor: indexByAuthor(),
    byPopularity: sortByPopularity(),
    byCreationDate: sortByCreationDate()
  };

  return ret;

}

module.exports = Index;