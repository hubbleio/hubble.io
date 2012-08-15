var        fs  = require('fs'),
         async = require('async'),
          zlib = require('zlib'),
           tar = require('tar'),
       request = require('request'),
      Comments = require('./comments'),
      Github   = require('./github'),
        marked = require('github-flavored-markdown').parse,
            hl = require('highlight').Highlight;

var dir = __dirname + '/../tmp';

function Article(conf, repo, githubInfo) {

  var github = Github(conf);

  var ret = {
    name: githubInfo.name,
    github: githubInfo
  };

  function markdownToMarkup(markdown, callback) {
    // Hack: if the document contains an iframe we use marked, since github markdown filters out those
    if (markdown.indexOf('iframe') > -1) {
      var markup = hl(marked(markdown), false, true);
      callback(null, markup);
    } else {
      github.markdownToMarkup(markdown, function(err, markup) {
        if (err) { return callback(err); }
        //console.log('markup before: %s', markup);
        // markup = hl(markup);
        // console.log('markup after: %s', markup);
        callback(null, markup);
      });
    }
  }

  //
  // Download a repo
  //
  function download(done) {
    var url = 'https://github.com/' + conf.orgname + '/' + repo + '/tarball/master';

    //console.log('[hubble] Attempting to download `' + url + '`.');

    var calledback = false;
    function callback(err) {
      if (err) {
        console.error('Error downloading or extracting from url %s', url, err.stack);
      }
      if (! calledback) {
        calledback = true;
        done(err);
      }
    }

    function getfiles() {

      var destPath = dir + '/' + repo;
      //console.log('destPath:', destPath);
      
      try {
        fs.mkdirSync(destPath);
      } catch(err) {
        // do nothing
      }

      var gunzip = zlib.Gunzip();

      gunzip.on('error', callback);

      request(url)
        .pipe(gunzip)
        .pipe(tar.Extract({ path: destPath }))
        .on('entry', function(entry) {
          //
          // tell the op that we've found a file and that we are unpacking it.
          // we dont care about directories or other assets because everything
          // is hosted on github.
          //
          // if (entry.type === 'File') {
          //   console.log('[hubble] Unpacking `' + entry.path + '`.');
          // }
        })
        .on('end', callback)
        .on('error', callback);

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
  }

  function determineOldestRepoVersion (repoPath, done) {
    var latestVersion;

    fs.readdir(repoPath, function(err, repoFiles) {
      if (err) { return done(err); }

      async.forEach(repoFiles, function(version, next) {
        var versionPath = repoPath + '/' + version;
        fs.stat(versionPath, function(err, stat) {
          if (err) { return next(err); }
          if (! stat.isDirectory()) { return next(); }
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
  // function getMETA(repo, filename, next)
  // @param filename {String} the name of the file that has been downloaded and extracted.
  // @param next {Function} what do when done.
  //
  // get the configuration from the directory.
  //
  function getMETA (filename, next) {
    fs.readFile(filename, 'utf8', function (err, data) {
      var meta;

      if (err) {
        return next(err);
      }

      try {
        meta = JSON.parse(data);
      } catch (err) {
        console.error(err.stack);
        return next(new Error('Error parsing repo data:' + data + ':' + err));
      }

      if (meta.authors && ! Array.isArray(meta.authors)) {
        meta.authors = [meta.authors];
      }

      ret.meta = meta;
      next(null, meta);
    });
  }



  //
  // function getMarkup(name, filename, next)
  // @param filename {String} the name of the file that has been downloaded and extracted.
  // @param next {Function} what do when done.
  //
  // get the content from the directory.
  //
  function getMarkup(filename, next) {
    fs.readFile(filename, 'utf8', function (err, data) {
      if (err) {
        return next(err);
      }

      //repo.files[filename].markup = data;
      markdownToMarkup(data, function(err, markup) {
        if (err) { return next(err); }
        ret.markup = markup;
        next();
      });
    });
  }



  //
  // Load repo from local cache
  //
  function loadRepo (done) {
    var repoPath = dir + '/' + repo;
    determineOldestRepoVersion(repoPath, function(err, latestVersionPath) {
      if (err) {
        if (err.code !== 'ENOTDIR') { return done(err); }
        else return done();
      }
      if (! latestVersionPath) { return done(); }

      fs.readdir(latestVersionPath, function(err, repoFiles) {
        if (err) { return next(err); }

        //
        // iterate over all of the files that were found in the
        // archive and then pull their contents into the repos.
        //

        async.forEach(repoFiles, function (path, next) {
          if (~path.indexOf('article.md')) {
            getMarkup(latestVersionPath + '/' + path, next);
          }
          else if (~path.indexOf('article.json')) {
            getMETA(latestVersionPath+ '/' + path, next);
          }  else if (~path.indexOf('index.json')) {
            getMETA(latestVersionPath+ '/' + path, function(err, meta) {
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

  //
  // Fetch all discussions form GitHub API
  //
  function fetchDiscussions(callback) {
    var comments = Comments(conf);
  
    comments.get(ret, function(err, comments) {
      if (err) { return callback(err); }
      ret.discussions = comments;
      callback();
    });
  }

  function load(pleaseDownload, callback) {
    function afterDownload() {
      loadRepo(function(err) {
        if (err) { return callback(err); }
        fetchDiscussions(callback);
      });
    }

    if (pleaseDownload) {
      download(function(err) {
        if (err) { return callback(err); }
        afterDownload();
      });
    } else {
      afterDownload();
    }
  }


  ret.load = load;
  return ret;
}

module.exports = Article;