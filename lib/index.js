var format = require('util').format;

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
    var authors = {};
    articles.forEach(function(article) {
      if (! article.meta) { return; }
      var articleAuthors = article.meta.authors || article.meta.author;
      if (! Array.isArray(articleAuthors)) {
        articleAuthors = [articleAuthors];
      }
      articleAuthors.forEach(function(author) {
        if ('object' !== typeof author) {
          author = {
            name: author
          };
        }

        if (! author.name) {
          return;
        }

        if (! authors[author.name]) {
          authors[author.name] = {
            meta: author,
            articles: []
          };
        }
        
        //
        // Fill missing author info
        //
        Object.keys(author).forEach(function(key) {
          var value = author[key];
          if (authors[author.name].meta[key] && authors[author.name].meta[key] !== value) {
            throw new Error(
              format('Inconsistency between authors: %j and %j for author %s in article %s',
                     authors[author.name].meta[key],
                     author[key],
                     author.name,
                     article.meta.title));
          } else {
            if (key === 'url' && value.match(/^https?:\/\/github\.com/)) {
              authors[author.name].meta['github'] = value;
            }
            authors[author.name].meta[key] = value;
          }
        });


        authors[author.name].articles.push(article);
      });
    });

    return authors;
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

  function fixAuthorsInArticles() {
    articles.forEach(function(article) {
      if (! article.meta) { return; }
      var authors = article.meta.authors || article.meta.author;
      if (! Array.isArray(authors)) {
        article.meta.authors = authors = [authors];
      }
      authors.forEach(function(author, idx) {
        if (! author) { return; }
        if (typeof author === 'string') {
          author = {
            name: author
          };
        }
        author = ret.byAuthor[author.name];
        authors[idx] = author;
      });
    });
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

  fixAuthorsInArticles();

  return ret;

}

module.exports = Index;