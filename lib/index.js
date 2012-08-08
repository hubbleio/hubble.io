var format = require('util').format,
    difficultyLevels = require('./difficulty_levels')
    inspect = require('util').inspect
    ;

var visited = [];
function rehash(o) {
  if (visited.indexOf(o) >= 0) {
    return;
  }
  visited.push(o);
  if (Array.isArray(o)) {
    o.forEach(rehash);
  } else if ('object' === typeof o) {
    delete o.articles;
    Object.keys(o).forEach(function(key) {
      rehash(o[key]);
    });
  }
  return o;
}

function debug(o) {
  console.log(inspect(o, false, 10));
}

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

function fixCategory(category, prefix) {
  if (! prefix) { prefix = ''; }
  
  category.id = category.name;
  
  if (prefix) {
    category.id = prefix + '--' + category.id;
  }

  if (category.children) {
    category.children.forEach(function(child) {
      fixCategory(child, category.id);
    });
  }

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
    var index = {
      children: {}
    };

    articles.forEach(function(article) {
      if (article.name === 'index') { return; }
      if (article.meta && article.meta.categories) {
        if (! Array.isArray(article.meta.categories)) { article.meta.categories = [article.meta.categories]; }
        article.meta.categories.forEach(function(catPath) {
          if (! Array.isArray(catPath)) { catPath = [catPath]; }
          var parent = index;
          catPath.forEach(function(cat) {
            var child = parent.children[cat];
            if (! child) {
              parent.children[cat] = child = {
                name: cat,
                id: cat,
                parent: parent,
                articles: [],
                children: {}
              };
              if (parent.id) {
                child.id = parent.id + '--' + child.id;
              }
              
            }
            child.articles.push(article);
            parent = child;
          });
        });
      }
    });

    return index.children;
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
    var cats = index.meta.categories;

    cats.forEach(function(cat) {
      fixCategory(cat);
    });
    return cats;
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

  function fixCategoriesInArticles() {
    articles.forEach(function(article) {
      if (! article.meta) { return; }
      var categories = article.meta.categories;
      var replaceCategories = [];
      if (! Array.isArray(categories)) { categories = [categories]; }
      categories.forEach(function(categoryPath, idx) {
        if (! Array.isArray(categoryPath)) {
          categories[idx] = categoryPath = [categoryPath];
        }
        var parent = ret.byCategory;
        var cat;
        categoryPath.forEach(function(cat) {
          cat = parent[cat];
        });
        replaceCategories.push(cat);
      });
      article.meta.categories = replaceCategories;
    });
  }

  function sortArticlesInAuthors() {
    Object.keys(ret.byAuthor).forEach(function(authorName) {
      var author = ret.byAuthor[authorName];
      author.articles.sort(byCreatedAt);
    });
  }

  function sortArticlesInCategories() {
    Object.keys(ret.byCategory).forEach(function(categoryName) {
      var articles = ret.byCategory[categoryName].articles;
      articles.sort(byCreatedAt);
    });
  }

  function pruneEmptyCategories(cats) {
    if (! cats) { cats = ret.byCategory; }
    Object.keys(cats).forEach(function(catName) {
      var cat = cats[catName];
      if (! cat.articles || ! cat.articles.length) {
        delete cats[catName];
      }
      pruneEmptyCategories(cats.children || {});
    });
  }

  function searchCategory(cat) {
    if ('string' === typeof cat) {
      cat = cat.split('--');
    }
    if (! Array.isArray(cat)) {
      cat = [cat];
    }
    cat = cat.splice(0);
    var children = ret.byCategory;
    var finalCat;
    cat.forEach(function(catPath) {
      finalCat = children[catPath];
      if (finalCat) {
        children = finalCat.children;
      }
    });
    return finalCat;
  }

  var ret = {
    byName: indexByName(),
    byCategory: indexByCategory(),
    byAuthor: indexByAuthor(),
    byPopularity: sortByPopularity(),
    byCreationDate: sortByCreationDate(),
    byDifficultyLevel: indexByDifficultyLevel(),
    searchCategory: searchCategory
  };
  
  ret.categories = sortCategories();
  
  fixAuthorsInArticles();
  
  sortArticlesInAuthors();
  sortArticlesInCategories();

  pruneEmptyCategories();

  return ret;

}

module.exports = Index;