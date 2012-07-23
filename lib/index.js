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

  function indexByDifficultyLevel() {

    function levelRange(l) {
      if (l < 4) {
        return 'beginner';
      }
      if (l < 7) {
        return 'intermediate';
      }
      return 'expert';
    }

    var levels = {
      'beginner': [],
      'intermediate': [],
      'expert': []
    };

    articles.forEach(function(article) {
      if (article.meta && article.meta.difficulty) {
        var level = levelRange(article.meta.difficulty);
        levels[level].push(article);
      }
    });

    return levels;
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

  function sortCategories() {
    var index = ret.byName['index'];
    if (! index) {
      throw new Error('Could not find index repo');
    }
    return index.meta.categories;
  }

  var ret = {
    byName: indexByName(),
    byCategory: indexByCategory(),
    byAuthor: indexByAuthor(),
    byPopularity: sortByPopularity(),
    byCreationDate: sortByCreationDate(),
    byDifficultyLevel: indexByDifficultyLevel()
  };
  ret.categories = sortCategories();

  return ret;

}

module.exports = Index;