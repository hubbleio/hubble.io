var fs     = require('fs'),
    Plates = require('plates'),
    _      = require('underscore'),
    marked = require('github-flavored-markdown').parse,
    hl     = require('highlight').Highlight,
    sort   = require('./sort')
;

var escape = encodeURIComponent;

module.exports = function(conf) {

  var assets = {};

  //
  // each asset contains two members. One is a `composer` function with special 
  // instructions on what to do with the other property, the raw html value.
  //

  assets['layout.html'] = {
    raw: fs.readFileSync('./public/assets/layout.html', 'utf8'),
    compose: function(nav, categories, main, title) {
      var data = {
        menu: assets['categories.html'].compose(categories),
        main: main,
        orgname: conf.orgname || 'Orgname',
        title: title,
        toptitle: title,
        'primary-nav': nav
      }
      return Plates.bind(this.raw, data);
    }
  }

  assets['pages/article.html'] = {
    raw: fs.readFileSync('./public/assets/pages/article.html', 'utf8'),
    compose: function(categories, repo, articleCategories, suggestions) {

      var html = this.raw;
      var output = '';

      if (repo.markup && repo.github && repo.meta) {

        if (! suggestions) { suggestions = []; }

        var suggestionMarkup = assets['listing.html'].compose(suggestions);
        if (suggestions.length) { suggestionMarkup = '<h3>Suggestions for further reading:</h3>' + suggestionMarkup; } // HACK

        var articleCategories = (repo.meta.categories || []).map(function(categoryChain) {
          return assets['category_chain_link.html'].compose(categoryChain);
        }).join('');

        var data = {
          "body": repo.markup,
          "difficulty": repo.meta.difficultyLabel || 'Unknown',
          "created": repo.github.created_at,
          "updated": repo.github.updated_at,
          "contributorlist": assets['article_contributors.html'].compose(repo),
          "articleCategories": articleCategories,
          "tags": assets['tags.html'].compose(repo.meta.tags),
          "suggestions": suggestionMarkup,
          "discussions": assets['discussions/index.html'].compose(repo, repo.discussions)
        };
        var title = repo.meta.title || repo.github.title;
        var nav = assets['nav/article.html'].compose(repo.github.name);

        return repo.composed = assets['layout.html'].compose(nav, categories, Plates.bind(html, data), title);
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
        var name = tag.name || tag;
        var presentName = name;
        if (tag.repos) { presentName += ' (' + tag.repos.length + ')'; }
        var data = {
          "name": presentName,
          "url": "/tags/" + escape(name)
        };
        output += Plates.bind(that.raw, data, map);
      }

      if (Array.isArray(tags)) {
        tags.forEach(function(tag) {
          sortedTags.push(tag);
        });
      } else if (typeof(tags) === 'object') {
        sortedTags = Object.keys(tags).map(function(tagName) { return tags[tagName]; })
      }

      sortedTags.sort(sort.tags.byRepoCount).map(renderTag);

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
      map.where('href').is('/like').use('like-action').as('data-action');
      map.where('href').is('/fork').use('fork-action').as('data-action');
      map.class('created').to('created');
      map.class('updated').to('updated');
      map.class('difficulty').to('difficulty');
      map.where('href').is('/difficulty').use('difficultyURL').as('href');

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
            "like-action": '/article/' + escape(repo.github.name) + '/like',
            "fork-action": '/article/' + escape(repo.github.name) + '/fork',
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

  assets['category.html'] = {
    raw: fs.readFileSync('./public/assets/category.html', 'utf8'),
    rawTerminal: fs.readFileSync('./public/assets/category_terminal.html', 'utf8'),
    compose: function(cat) {
        if (! cat.id) { return ''; }
        
        var name = cat.name;
        
        if (! cat.children) { name += ' (' + (cat.repos || []).length + ')'; }

        var map = new Plates.Map();
        map.class('category').to('name');
        map.class('category').to('url').as('href');
        map.class('subcategories').to('subcategories');
        
        var data = {
          "name": name,
          "url": "/categories/" + cat.id,
          "subcategories": assets['categories.html'].compose(cat.children)
        };

        return Plates.bind(cat.children ? this.raw : this.rawTerminal, data, map);
    }
  };

  assets['categories.html'] = {
    raw: fs.readFileSync('./public/assets/categories.html', 'utf8'),
    compose: function(categories) {

      if (! categories) { return ""; }

      if (! Array.isArray(categories)) {
        categories = Object.keys(categories).map(function(catName) {
          return categories[catName];
        });
      }

      var composedCategories = categories.map(function(cat) {
        return assets['category.html'].compose(cat);
      }).join('');

      var map = new Plates.Map();
      map.class('categories').to('categories');

      return Plates.bind(this.raw, {categories: composedCategories}, map);
    }
  };


  assets['pages/index.html'] = {
    raw: fs.readFileSync('./public/assets/pages/index.html', 'utf8'),
    compose: function(repos, contributors, tags, categories, articleCount, title) {

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
        "articles": listing.compose(composableRepos),
        "contributors": assets['contributors.html'].compose(repos, contributors),
        "tags": assets["tags.html"].compose(tags),
        "categories": assets["categories.html"].compose(categories)
      };

      var nav = assets['nav/home.html'].compose();

      return repos['repository-index'].composed = assets['layout.html']
               .compose(nav, categories, Plates.bind(this.raw, data), title);

    }
  };


  assets['pages/tag.html'] = {
    raw: fs.readFileSync('./public/assets/pages/tag.html', 'utf8'),
    compose: function(categories, tag) {

      var listing = assets['listing.html'];

      var data = {
        "orgname": 'Orgname', // conf['orgname']
        "title": 'Tagline', // conf['tagline']
        "tag": "Tag \"" + tag.name + "\"",
        "articles": listing.compose(tag.repos),
      };

      var nav = assets['nav/dir.html'].compose();

      return tag.composed = assets['layout.html']
               .compose(nav, categories, Plates.bind(this.raw, data), tag.name);

    }
  };

  assets['pages/category.html'] = {
    raw: fs.readFileSync('./public/assets/pages/category.html', 'utf8'),
    compose: function(category, categories, orgname) {

      var listing = assets['listing.html'];

      var categoryChain = [],
          currentNode = category;

      categoryChain.push(currentNode.name);
      
      while (currentNode.parent) {
        currentNode = currentNode.parent;
        categoryChain.push(currentNode.name);
      } 

      categoryChain = categoryChain.reverse();

      var data = {
        "category": assets['category_chain_link.html'].compose(categoryChain),
        "articles": listing.compose(category.repos.sort(sort.repos.byDifficulty)),
      };

      var nav = assets['nav/dir.html'].compose();

      return category.composed = assets['layout.html']
               .compose(nav, categories, Plates.bind(this.raw, data), category.name);
      
    }
  };

  assets['category_chain_link.html'] = {
    raw: fs.readFileSync('./public/assets/category_chain_link.html', 'utf8'),
    compose: function(categoryChain) {

      var categoryLink = assets['category_link.html'];
      var index = 0;

      var map = new Plates.Map();
      map.class('categoryChain').to('name');

      if (! Array.isArray(categoryChain)) { categoryChain = [categoryChain]; }

      var id = [];
      var name = categoryChain.map(function(category) {
        index += 1;
        id.push(escape(category));
        return categoryLink.compose(category, id, categoryChain.length === index);
      }).join('');

      var data = {
        "name": name
      };

      return Plates.bind(this.raw, data, map);
    }
  };

  assets['category_link.html'] = {
    raw: fs.readFileSync('./public/assets/category_link.html', 'utf8'),
    rawUnlinked: fs.readFileSync('./public/assets/category_raw.html', 'utf8'),
    compose: function(category, id, last) {
      var map = new Plates.Map();
      map.class('category').to('name');
      map.class('category').to('url').as('href');
      
      var data = {
        "name": category,
        "url": "/categories/" + escape(id.join('--'))
      };

      return Plates.bind(last ? this.raw : this.rawUnlinked, data, map);
    }
  };

  /*******************
   * Navigation
   *******************/

  assets['nav/home.html'] = {
    raw: fs.readFileSync('./public/assets/nav/home.html', 'utf8'),
    compose: function() {
      return this.raw;
    }
  };

  assets['nav/article.html'] = {
    raw: fs.readFileSync('./public/assets/nav/article.html', 'utf8'),
    compose: function(repoName) {
      var map = new Plates.Map({create: true});
      map.where('href').is('/watch').use('likeURL').as('data-action');
      map.where('href').is('/fork').use('forkURL').as('data-action');

      var data = {
        likeURL: '/article/' + escape(repoName) + '/like',
        forkURL: '/article/' + escape(repoName) + '/fork'
      };

      return Plates.bind(this.raw, data, map);
    }
  };

  assets['nav/dir.html'] = {
    raw: fs.readFileSync('./public/assets/nav/dir.html', 'utf8'),
    compose: function() {
      return this.raw;
    }
  };

  /*******************
   * Discussions
   *******************/

  assets['discussions/index.html'] = {
    raw: fs.readFileSync('./public/assets/discussions/index.html', 'utf8'),
    compose: function(repo, discussions) {
      var discussions = discussions.map(function(discussion) {
        return assets['discussions/discussion.html'].compose(repo, discussion);
      }).join('');

      var map = new Plates.Map();
      map.class('newdiscussion').use('url').as('action');
      map.class('discussionlist').use('discussionlist');

      var data = {
        url: '/article/' + escape(repo.github.name) + '/comment',
        discussionlist: discussions
      };

      return Plates.bind(this.raw, data, map);
    }
  };

  assets['discussions/discussion.html'] = {
    raw: fs.readFileSync('./public/assets/discussions/discussion.html', 'utf8'),
    compose: function(repo, discussion) {
      var map = new Plates.Map();
      map.class('author').use('author');
      map.class('title').use('title');
      map.class('body').use('body');
      map.class('avatar').use('avatar').as('src');
      map.class('created').use('created');
      map.class('comments').use('comments');
      map.class('discussion').use('url').as('data-url')

      var commentsMarkup = (discussion.comments || []).map(function(comment) {
        return assets['discussions/comment.html'].compose(comment);
      }).join('');

      var data = {
        url: '/articles/' + escape(repo.github.name) + '/comment',
        author: '<a href="https://github.com/' + discussion.user.login + '">' + discussion.user.login + '</a>',
        title: discussion.title,
        body: hl(marked(discussion.body), false, true),
        avatar: discussion.user && discussion.user.avatar_url,
        created: discussion.created_at,
        comments: commentsMarkup
      }

      return Plates.bind(this.raw, data, map);
    }
  };

  assets['discussions/comment.html'] = {
    raw: fs.readFileSync('./public/assets/discussions/comment.html', 'utf8'),
    compose: function(comment) {

      var map = new Plates.Map();
      map.class('author').use('author');
      map.class('avatar').use('avatar').as('src');
      map.class('body').use('body');
      map.class('created').use('created')

      var data = {
        author: '<a href="https://github.com/' + comment.user.login + '">' + comment.user.login + '</a>',
        body: hl(marked(comment.body), false, true),
        avatar: comment.user && comment.user.avatar_url,
        created: comment.created_at
      };

      return Plates.bind(this.raw, data, map);
    }
  }

  return assets;
};