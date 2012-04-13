/*
 *
 * content.js
 * merges the content from github into the html templates 
 * and creates a repos for it in memory if one does not exist.
 *
 */

var        fs  = require('fs'),
         async = require('async'),
          zlib = require('zlib'),
           tar = require('tar'),
        marked = require('github-flavored-markdown').parse,
        hl     = require("highlight").Highlight,
       request = require('request'),
        Plates = require('plates'),
    difficulty = require('./difficulty'),
       Suggest = require('./suggest');

var dir = __dirname + '/tmp';

var Content = module.exports = function(conf, callback) {

  var that = this;
  this.conf = conf || {};

  this.repos = {
    'repository-index': { 
      composed: ''
    }
  };

  this.apihost = conf.apihost || 'https://api.github.com';
  this.orgname = conf.orgname || 'hubbleio';

  this.assets = {};
  this.categories = {};
  this.contributors = {};
  this.tags = {};
  this.difficulties = {};
};

Content.prototype.getArticle = function(name) {
  return this.repos[name].composed;
};

Content.prototype.getIndex = function() {
  return this.repos['repository-index'].composed;
};

Content.prototype.getTag = function(tagName) {
  var tag = this.tags[tagName];
  return tag && tag.composed;
}

Content.prototype.getCategory = function(categoryName) {
  var children  = this.categories,
      catChain = categoryName.split('--'),
      comp, cat;
  
  while(catChain.length) {
    comp = catChain.shift();
    cat = children[comp];
    if (! cat) { return; }
    children = cat.children;
  }
  return cat && cat.composed;
}

Content.prototype.getRepo = function(name) {
  return this.repos[name];
}

//
// function compose()
//
// compose everything once when we start the server.
//
Content.prototype.compose = function (assets, repos) {

  var that = this;
  var suggest = Suggest(this.repos, this.tags, this.categories);

  //
  // Compose for all items in the repos.
  //
  Object.keys(this.repos).forEach(function (name) {
    var repo = that.repos[name];
    assets['pages/article.html'].compose(that.categoryIndex, repo, that.categoryIndex, suggest(repo, 5)); // TODO: 5 should not be hardcoded
  });

  //
  // Compose for all the tags in the repos.
  //
  Object.keys(this.tags).forEach(function (name) {
    var tag = that.tags[name];
    assets['pages/tag.html'].compose(that.categoryIndex, tag);
  });

  //
  // Compose for all the categories in the repos.
  //

  (function composeCategory(categories) {
    Object.keys(categories).forEach(function (name) {
      var cat = categories[name];
      assets['pages/category.html'].compose(cat, that.categoryIndex);
      composeCategory(cat.children);
    });
  }(this.categories));

  //
  // if there are any updates, refresh the index.
  //
  assets['pages/index.html'].compose(this.repos, this.contributors, this.tags, this.categoryIndex, 5, this.conf.title);
};


// function downloadReposGithubInfo(callback)
// @option callback {Function} what do once all done.
//
Content.prototype.downloadReposGithubInfo = function (callback) {

  var that = this;
  var url = this.apihost + '/orgs/' + encodeURIComponent(this.orgname) + '/repos';

  console.log('[hubble] Putting hubble in orbit around `' + url + '`.');

  request(url, function (err, res, body) {
    if (err) {
      return callback(err);
    }

    if (res.statusCode > 299) {
      return callback(new Error('Github returned status:' + res.statusCode));
    }
    
    var cfg = JSON.parse(body);

    cfg.forEach(function(repo) {
      if (! that.repos[repo.name]) {
        that.repos[repo.name] = {};
      }
      that.repos[repo.name].github = repo;
    });

    callback();

  });
}

//
// function downloadAll(callback)
// @option callback {Function} what do once all done.
//
Content.prototype.downloadAll = function (callback) {

  var that = this;

  this.downloadReposGithubInfo(function(err) {
    if (err) { return callback(err); }

    console.log('[hubble] downloaded github info. I\'m about to scan %d repos.', Object.keys(that.repos).length);

    async.forEach(Object.keys(that.repos), function(repoName, next) {
      that.download(repoName, next);
    }, callback);

  });

};

//
// function download(repo, callback)
// @param repo {String} the name of the repo to get the zipball from
// @param callback {Function} what do once all done.
//
// grabbing the entire zipball will allow us to pull down images and other
// stuff that we might want to allow the article to include when served.
//
Content.prototype.download = function (repo, callback) {

  var that = this;

  var url = 'https://github.com/' + this.orgname + '/' + repo + '/tarball/master';
  var queue = [];

  console.log('[hubble] Attempting to download `' + url + '`.');

  function getfiles() {

    request(url)
      .pipe(zlib.Gunzip())
      .pipe(tar.Extract({ path: dir + '/' + repo }))
      .on('entry', function(entry) {
        //
        // tell the op that we've found a file and that we are unpacking it.
        // we dont care about directories or other assets because everything
        // is hosted on github.
        //
        if (entry.type === 'File') {
          console.log('[hubble] Unpacking `' + entry.path + '`.');
        }
      }).on('end', callback);
  }

  fs.stat(dir, function (err, d) {
    if (err) { return callback(err); }
    if (d && d.isDirectory()) {
      return getfiles();
    }

    fs.mkdir(dir, function (err) {
      if (err && err.code !== 'EEXIST') {
        return callback(err);
      }
      
      getfiles();
    });
  });
};


//
// function loadRepos(callback)
// @param callback {Function} what do when done Signature: (err).
//
// get the configuration from the directory.
//
Content.prototype.loadRepos = function (callback) {
  var that = this;

  //
  // Since a repo may have multiple versions downloaded,
  // this function checks to see which one was updated the latest,
  // which would mean it's the latest version.
  //
  function determineOldestRepoVersion (repoPath, done) {
    var latestVersion;

    fs.readdir(repoPath, function(err, repoFiles) {
      if (err) { return done(err); }

      async.forEach(repoFiles, function(version, next) {
        var versionPath = repoPath + '/' + version;
        fs.stat(versionPath, function(err, stat) {
          if (err) { return next(err); }
          if (! latestVersion || latestVersion.mtime < stat.mtime) {
            latestVersion = { mtime: stat.mtime, path: versionPath };
          }
          next();
        });
      }, function(err) {
        if (err) { return done(err); }
        done(null, latestVersion && latestVersion.path);
      });
    });
  }

  //
  // loadRepo actually loads the repo markup and metadata into memory
  //
  function loadRepo (repoName, done) {
    //that.repos[repoName] = {};
    var repoPath = dir + '/' + repoName;
    determineOldestRepoVersion(repoPath, function(err, latestVersionPath) {
      if (err) { return next(err); }
      if (! latestVersionPath) { return done(); }

      fs.readdir(latestVersionPath, function(err, repoFiles) {
        if (err) { return next(err); }

        //
        // iterate over all of the files that were found in the
        // archive and then pull their contents into the repos.
        //

        async.forEach(repoFiles, function (path, next) {
          if (~path.indexOf('article.md')) {
            that.getMarkup(repoName, latestVersionPath + '/' + path, next);
          }
          else if (~path.indexOf('article.json')) {
            that.getMETA(repoName, latestVersionPath+ '/' + path, next);
          }  else if (~path.indexOf('index.json')) {
            that.getMETA(repoName, latestVersionPath+ '/' + path, function(err, meta) {
              if (err) { return next(err); }
              if (meta) { meta.title = 'index'; }
              return next();
            });
          } else {
            next();
          }
        }, done);
      });
    });
  }

  this.downloadReposGithubInfo(function(err) {
    if (err) { return callback(err); }
    
    fs.readdir(dir, function(err, files) {
      if (err) { return callback(err); }
      async.forEach(files, loadRepo, callback);
    });

  });
}

//
// function getMETA(repo, filename, next)
// @param repo {String} the name of the repo to get the zipball from
// @param filename {String} the name of the file that has been downloaded and extracted.
// @param next {Function} what do when done.
//
// get the configuration from the directory.
//
Content.prototype.getMETA = function (repo, filename, next) {
  var that = this;
  fs.readFile(filename, 'utf8', function (err, data) {
    var meta;

    if (err) {
      return next(err);
    }

    if (! that.repos[repo]) { that.repos[repo] = {}; }

    console.log('[hubble] Caching meta data from `' + filename + '`.');
    that.repos[repo].files = that.repos[repo].files || {};
  
    if (!that.repos[repo].files[filename]) {
      that.repos[repo].files[filename] = {};
    }

    try {
      meta = JSON.parse(data);
    } catch (err) {
      console.error('Error parsing repo data:' + data);
      return next();
    }

    that.repos[repo].meta = meta;    
    that.repos[repo].files[filename].meta = meta;
    next(null, meta);

  }); 

};

//
// function getMarkup(name, filename, next)
// @param repo {String} the name of the repo to get the zipball from
// @param filename {String} the name of the file that has been downloaded and extracted.
// @param next {Function} what do when done.
//
// get the content from the directory.
//
Content.prototype.getMarkup = function (repoName, filename, next) {
  var repo ;
  var that = this;

  if (! this.repos[repoName]) { this.repos[repoName] = {}; }

  repo = this.repos[repoName];
  fs.readFile(filename, 'utf8', function (err, data) {
    if (err) {
      return next(err);
    }

    console.log('[hubble] Transforming markdown from `' + filename + '`.');
    repo.files = repo.files || {};
  
    if (!repo.files[filename]) {
      repo.files[filename] = {};
    }
    
    //repo.files[filename].markup = data;
    repo.markup = hl(marked(data), false, true);;
    next();
  });
};

//
// function createCategoryIndex()
//
// Create a category index based on the "index" repo
//
Content.prototype.createCategoryIndex = function () {
  var indexRepo = this.repos['index'],
      repoNames = Object.keys(this.repos),
           that = this,
         escape = encodeURIComponent;

  if (indexRepo && indexRepo.meta && indexRepo.meta.categories) {
    this.categoryIndex = indexRepo.meta.categories;
  }

  function findChildCategory(parentCategory, categoryName) {
    var children = (parentCategory.children || []);
    for(var i = 0; i < children.length; i += 1) {
      var child = children[i];
      if (child.name === categoryName) {
        return child;
      }
    }
  }


  // Put each repo inside the respective index category
  repoNames.forEach(function(repoName) {
    if (repoName === 'index') { return; }
    var repo = that.repos[repoName];
    if (repo.meta && repo.meta.categories) {
      (repo.meta.categories || []).forEach(function(categories) {
        var currentIndexCategory = that.categoryIndex,
            path = [],
            child = {children: that.categoryIndex},
            categoryId = [],
            category;

        if (! Array.isArray(categories)) { categories = [categories]; }
        for(var i = 0; i < categories.length; i += 1) {
          category = categories[i];
          
          //
          // Composing the path for debugging
          //
          path.push(category);

          //
          // Find the child category of current category by name
          //
          child = findChildCategory(child, category);
          if (! child) {
            console.log(
              'Warning: problem parsing repo %s: could not find %s in category index under %s',
              repo.github.name,
              category, path.join(' > '));
            break;
          }

          //
          // Add to category id so we can later compose URLs for this
          //
          categoryId.push(escape(category));
          
          if (! child.repos) { child.repos = []; }
          
          //
          // Compose child.id if there is none
          //
          if (! child.id) { child.id = categoryId.join('--'); }

          //
          // Push repo into category repos
          //
          child.repos.push(repo);
        }
      });
    }

  })
}

//
// function reduceCategories()
//
// Aggregate on meta categories
//
Content.prototype.reduceCategories = function () {
  var repoNames = Object.keys(this.repos),
      that = this;
  
  var escape = encodeURIComponent;

  repoNames.forEach(function(repoName) {
    var repo = that.repos[repoName];

    if (repo.meta && repo.meta.categories) {
      if (! Array.isArray(repo.meta.categories)) { repo.meta.categories = [repo.meta.categories]; }
      
      repo.meta.categories.forEach(function(categoryChain) {
        if (! Array.isArray(categoryChain)) { categoryChain = [categoryChain]; }
        var currentCategoryChildren = that.categories,
            categoryId = [],
            parent;
        
        categoryChain.forEach(function(category) {
          categoryId.push(escape(category));
          if (! currentCategoryChildren[category]) { currentCategoryChildren[category] =
            {
              id: categoryId.join('--'),
              name: category,
              children: {},
              parent: parent,
              repos: []
            };
          }
          parent = currentCategoryChildren[category];
          parent.repos.push(repo);
          currentCategoryChildren = parent.children;
        });
      });
    }
  });
};


//
// function reduceContributors()
//
// Aggregate on meta authors
//
Content.prototype.reduceContributors = function () {
  var repoNames = Object.keys(this.repos),
      that = this;
  
  this.contributors = repoNames.reduce(function(contributors, repoName) {
    var repo = that.repos[repoName],
        i, contributor;

    if (repo.meta && repo.meta.authors) {
      for(i  in repo.meta.authors) {
        contributor = repo.meta.authors[i];
        if (typeof(contributor) !== 'object') {
          contributor = {name: contributor};
          repo.meta.authors[i] = contributor;
        }
        if (! contributors[contributor.name]) {
          contributors[contributor.name] = contributor;
        }
        if (! contributor.repos) {
          contributor.repos = [];
        }
        contributor.repos.push(repo);
      }
    }
    return contributors;
  }, {});
};


//
// function reduceTags()
//
// Aggregate on meta tags
//
Content.prototype.reduceTags = function () {
  var repoNames = Object.keys(this.repos),
      that = this;
  
  this.tags = repoNames.reduce(function(tags, repoName) {
    var repo = that.repos[repoName];

    if (repo.meta && repo.meta.tags) {
      repo.meta.tags.forEach(function(tag) {
        if (! tags[tag]) { tags[tag] =
          {
            name: tag,
            repos: []
          };
        }
        tags[tag].repos.push(repo);
      });
    }
    return tags;
  }, {});
};

//
// function reduceDifficulties()
//
// Aggregate on meta.difficulty
//
Content.prototype.reduceDifficulties = function () {
    var repoNames = Object.keys(this.repos),
      that = this;
  
  repoNames.map(function(repoName) {
    var repo = that.repos[repoName],
        difficultyLabel;

    if (repo.meta && repo.meta.difficulty) {
      repo.meta.difficultyLabel = difficultyLabel = difficulty(repo.meta.difficulty);
      if (! that.difficulties[difficultyLabel]) { that.difficulties[difficultyLabel] = []; }
      that.difficulties[difficultyLabel].push(repo);
    }
  });

}

//
// function aggregate()
//
// Aggregate on meta tags and categories
//
Content.prototype.aggregate = function () {
  this.createCategoryIndex();
  this.reduceCategories();
  this.reduceContributors();
  this.reduceTags();
  this.reduceDifficulties();
};

