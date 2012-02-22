var fs     = require('fs'),
    Plates = require('plates'),
    marked = require('marked'),
    assets = module.exports,
    _      = require('underscore'),
    sort   = require('./sort');

var escape = encodeURIComponent;

//
// each asset contains two members. One is a `composer` function with special 
// instructions on what to do with the other property, the raw html value.
//
assets['article.html'] = {
  raw: fs.readFileSync('./public/assets/article.html', 'utf8'),
  compose: function(repo, categories) {

    var html = this.raw;
    var output = '';

    if (repo.markup && repo.github && repo.meta) {
      var data = {
        "orgname": 'Orgname', // conf['orgname']
        "title": repo.meta.title || repo.github.title,
        "main": marked(repo.markup),
        "difficulty": repo.meta.difficultyLabel || 'Unknown',
        "created": repo.github.created_at,
        "updated": repo.github.updated_at,
        "contributorlist": assets['article_contributors.html'].compose(repo),
        "categories": assets['categories.html'].compose(categories),
        "tags": assets['tags.html'].compose(repo.meta.tags)
      };
      return repo.composed = Plates.bind(html, data);
    }
    
  }
};

assets['article_contributors.html'] = {
  raw: fs.readFileSync('./public/assets/contributor.html', 'utf8'),
  compose: function(repo) {

    var authors = repo.meta.authors,
        output = '',
        that = this;

    var map = new Plates.Map();
    map.class('name').to('name');
    map.class('name').to('url').as('href');

    if (authors) {
      authors.forEach(function(author) {
        output += Plates.bind(that.raw, author, map);
      });
    }
    return output;
  }
};

assets['contributors.html'] = {
  raw: fs.readFileSync('./public/assets/contributor.html', 'utf8'),
  compose: function(repos, contributors) {

    var output = '',
        that = this;

    var map = new Plates.Map();
    map.class('name').to('name');
    map.class('name').to('url').as('href');

    if (contributors) {
      Object.keys(contributors).sort().forEach(function(contributorName) {
        var contributor = contributors[contributorName];
        output += Plates.bind(that.raw, contributor, map);
      });
    }
    return output;
  }
};

assets['tags.html'] = {
  raw: fs.readFileSync('./public/assets/tag.html', 'utf8'),
  compose: function(tags) {

    var output = '',
        that = this,
        sortedTags = [];

    var map = new Plates.Map();
    map.class('tag').to('name');
    map.class('tag').to('url').as('href');

    function renderTag(tag) {
      var data = {
        "name": tag,
        "url": "/tags/" + escape(tag)
      };
      output += Plates.bind(that.raw, data, map);
    }

    if (Array.isArray(tags)) {
      tags.forEach(function(tag) {
        if (typeof(tag) === 'object') {
          tag = tag.name
        }
        sortedTags.push(tag);
      });
    } else if (typeof(tags) === 'object') {
      sortedTags = Object.keys(tags);
    }

    sortedTags.sort().map(renderTag);

    return output;
  }
};

assets['listing.html'] = {
  raw: fs.readFileSync('./public/assets/listing.html', 'utf8'),
  compose: function(repos) {

    var html = this.raw;


    var map = new Plates.Map();

    map.class('description').to('description');
    map.class('fork').to('fork');
    map.class('fork').to('forkURL').as('href');
    map.class('title').to('title');
    map.class('title').to('url').as('href');
    map.class('like').to('like');
    map.class('created').to('created');
    map.class('updated').to('updated');
    map.class('difficulty').to('difficulty');
    map.class('difficulty').to('difficultyURL').as('href');

    var data = {};
    var output = '';

    Object.keys(repos).forEach(function(name, index) {
      var repo = repos[name];

      if (repo.meta && repo.github) {

        data = {
          "description": repo.meta.description || repo.github.description,
          "fork": repo.github.forks,
          "forkURL": repo.github.html_url,
          "like": repo.github.watchers,
          "created": repo.github.created_at,
          "updated": repo.github.updated_at,
          "url": '/article/' + escape(repo.github.name),
          "title": repo.meta.title || repo.github.title,
          "difficulty": repo.meta.difficultyLabel || 'Unknown',
          "difficultyURL": '/difficulties/' + escape(repo.meta.difficultyLabel)
        };

        output += Plates.bind(html, data, map);
      }
          
    });

    return output;
  }
};

assets['categories.html'] = {
  raw: fs.readFileSync('./public/assets/category.html', 'utf8'),
  compose: function(categories) {

    var output = '',
        that = this;

    var map = new Plates.Map();
    map.class('category').to('name');
    map.class('category').to('url').as('href');
    map.class('subcategories').to('subcategories');

    function printCategory(cat) {
      if (! cat.id) { return ''; }
      var name = cat.name;
      if (! cat.children) { name += ' (' + (cat.repos || []).length + ')'; }
      var data = {
        "name": name,
        "url": "/categories/" + cat.id,
        "subcategories": printCategories(cat.children)
      };
      return Plates.bind(that.raw, data, map);
    }
    
    
    function printCategories(categories) {
      if (! categories) { return ""; }
      if (! Array.isArray(categories)) {
        categories = Object.keys(categories).map(function(catName) {
          return categories[catName];
        });
      }
      return categories.map(printCategory).join('');
    }

    return printCategories(categories);
  }
};


assets['index.html'] = {
  raw: fs.readFileSync('./public/assets/index.html', 'utf8'),
  compose: function(repos, contributors, tags, categories, articleCount) {

    //
    // this comp function takes the entire repos because the index
    // should be built considering all of the repos in the org.
    //
    var listing = assets['listing.html'];

    var reposCopy = repos;

    if (typeof reposCopy === 'object') {
      reposCopy = Object.keys(reposCopy).map(function(repoName) { return reposCopy[repoName]; });
    }

    function filter(repo) {
      return repo.meta && repo.meta.title !== 'index';
    }

    var composableRepos = _.first(reposCopy.sort(sort.repos.byRecency).filter(filter), articleCount || 5);

    var data = {
      "orgname": 'Orgname', // conf['orgname']
      "title": 'Tagline', // conf['tagline']
      "articles": listing.compose(composableRepos),
      "contributors": assets['contributors.html'].compose(repos, contributors),
      "tags": assets["tags.html"].compose(tags),
      "categories": assets["categories.html"].compose(categories)
    };

    return repos['repository-index'].composed = Plates.bind(this.raw, data);

  }
};


assets['tag.html'] = {
  raw: fs.readFileSync('./public/assets/tag_page.html', 'utf8'),
  compose: function(tag) {

    var listing = assets['listing.html'];

    var data = {
      "orgname": 'Orgname', // conf['orgname']
      "title": 'Tagline', // conf['tagline']
      "tag": "Tag \"" + tag.name + "\"",
      "articles": listing.compose(tag.repos),
    };

    return tag.composed = Plates.bind(this.raw, data);

  }
};

assets['category_page.html'] = {
  raw: fs.readFileSync('./public/assets/category_page.html').toString(),
  compose: function(category) {

    var listing = assets['listing.html'];

    var data = {
      "orgname": 'Orgname', // conf['orgname']
      "title": 'Tagline', // conf['tagline']
      "category": "Category \"" + category.name + "\"",
      "articles": listing.compose(category.repos.sort(sort.repos.byDifficulty)),
    };

    return category.composed = Plates.bind(this.raw, data);
    
  }
};