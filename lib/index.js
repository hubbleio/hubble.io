var format = require('util').format,
    difficultyLevels = require('./difficulty_levels')
    ;

function cloneArray(arr) {
  var newArr = new Array(arr.length);
  for(var i = 0; i < arr.length; i ++) {
    newArr[i] = arr[i];
  }
  return newArr;
}

function byCreatedAt(a, b) {
  return (b.github && Date.parse(b.github.created_at) || 0) - (a.github && Date.parse(a.github.created_at) || 0);
}

function Index(articles) {

  function indexByName() {
    var index = {};
    articles.forEach(function(article) {
      index[article.name] = article;
    });
    return index;
  }


  function indexByCategory() {
    var index = {};

    articles.forEach(function(article) {
      if (article.name === 'index') { return; }
      if (article.meta && article.meta.categories) {
        article.meta.categories.forEach(function(cats) {
          if (! Array.isArray(cats)) { cats = [cats]; }
          cats.forEach(function(catPath) {
            if (! Array.isArray(catPath)) { catPath = [catPath]; }
            var parent;
            catPath.forEach(function(cat) {
              if (! index[cat]) {
                index[cat] = {
                  name: cat,
                  parent: parent,
                  articles: []
                };
              }
              index[cat].articles.push(article);
              parent = index[cat];
            });
          });
        });
      }
    });

    return index;
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

    var levels = {
      'beginner': [],
      'intermediate': [],
      'expert': []
    };

    articles.forEach(function(article) {
      if (article.meta && article.meta.difficulty) {
        var level = difficultyLevels.toString(article.meta.difficulty);
        levels[level].push(article);
      }
    });

    return levels;
  }

  function sortByPopularity() {
    return cloneArray(articles).sort(function(a, b) {
      return (b.github && b.github.watchers || 0) - (a.github && a.github.watchers || 0);
    });
  }

  function sortByCreationDate() {
    return cloneArray(articles).sort(byCreatedAt);
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

  function sortArticlesInAuthors() {
    Object.keys(ret.byAuthor).forEach(function(authorName) {
      var author = ret.byAuthor[authorName];
      author.articles.sort(byCreatedAt);
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
  sortArticlesInAuthors();

  return ret;

}

module.exports = Index;