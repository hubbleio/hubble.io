var request = require('request'),
    bubble  = require('bubble'),
    escape = encodeURIComponent,
    GITHUB_BASE_URL = 'https://api.github.com';

function Github(conf) {

  function githubRepoActionURL(pathComponents, session) {
    var url = GITHUB_BASE_URL + '/';
    url += pathComponents.map(function(pathComponent) {
      return escape(pathComponent);
    }).join('/');

    if (session) {
      url += '?access_token=' + escape(session.github.accessToken);
    }

    return url;
  }

  function like(repo) {
    var that = this;

    if (! this.req.session.user || ! this.req.session.user.login) {
      this.res.writeHead(403);
      return this.res.end('Please login first');
    }

    var b = bubble(function(err) {
      if (err) {
        console.error(err);
        that.res.writeHead(500);
        that.res.end(err.message);
      } else {
        that.res.writeHead(201);
        that.res.end(JSON.stringify({watchers: repo.github.watchers}));
      }
    });

    var url = githubRepoActionURL([ 'user',
                                    'watched',
                                    this.req.session.user.login,
                                    repo.github.name],
                                  this.req.session);

    request.put(url, b(function(response) {
      
      if (response.statusCode < 200 || response.statusCode >= 300) {
        if (response.statusCode === 404) {
          throw new Error('You already watch this repo');
        }
        throw new Error('Reply to github watch was status code:' + response.statusCode);
      }

      var url = githubRepoActionURL([ 'repos', conf.orgname, repo.github.name]);
      
      request.get(url, b(function(resp, body) {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          throw new Error('Reply from github repo get:' + response.statusCode);
        }

        repo.github = JSON.parse(body);

      }));

    }));

  }

  function fork(repo) {
    var that = this;

    if (! this.req.session.user || ! this.req.session.user.login) {
      this.res.writeHead(403);
      return this.res.end('Please login first');
    }

    var b = bubble(function(err) {
      if (err) {
        console.error(err);
        that.res.writeHead(500);
        that.res.end(err.message);
      } else {
        that.res.writeHead(201);
        var resp = {
          forks: repo.github.forks,
          url: 'https://github.com/' + escape(that.req.session.user.login) + '/' + escape(repo.github.name)
        };
        that.res.end(JSON.stringify(resp));
      }
    });

    var url = githubRepoActionURL(['repos', conf.orgname, repo.github.name, 'forks'], this.req.session);

    request.post(url, b(function(response) {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw new Error('Reply to github fork was status code:' + response.statusCode);
      }

      var b = bubble(function(err) {
        if (err) {
          console.error(err);
          that.res.writeHead(500);
          that.res.end(err.message);
        } else {
          that.res.writeHead(201);
          var resp = {
            forks: repo.github.forks,
            url: 'https://github.com/' + escape(that.req.session.user.login) + '/' + escape(repo.github.name)
          };
          that.res.end(JSON.stringify(resp));
        }
      });


      request.get(url, b(function(resp, body) {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          throw new Error('Reply from github repo get:' + response.statusCode);
        }

        repo.github = JSON.parse(body);

      }));

    }));


  }

  /******************
   * Issues
   ******************/

  var issues = (function() {

    function get(repo, callback) {
      request.get(githubRepoActionURL([ 'repos', conf.orgname, repo.github.name, 'issues']), function(err, resp, body) {
        if (err) { return callback(err); }
        try { body = JSON.parse(body); }
        catch(error) { err = error; }
        callback(err, body);
      });
    }

    function create(repo, title, body, callback) {
      var options = {
        uri: githubRepoActionURL(['repos', conf.orgname, repo.github.name, 'issues'], this.req.session),
        qs: {
          title: title,
          body: body
        }
      };

      request.post(options, function(err, resp, body) {
        if (err) { return callback(err); }
        if (resp.statusCode !== 201) {
          err = new Error('Github issue create returned status code ' + resp.statusCode);
        }
        callback(err);
      });
    }

    function issues(issue) {

      function createComment(body, callback) {
        var url = githubRepoActionURL([ 'repos',
                                        conf.orgname,
                                        repo.github.name,
                                        'issues',
                                        issue,
                                        'comments'],
                                      this.req.session);
        
        request.post(url, function(err, resp, body) {
          if (err) { return callback(err); }
          if (res.statusCode !== 201) { err = new Error('Error creating comment on github. status code: ' + resp.statusCode); }
          callback(err);
        });
      }

      return {
        comments: {
          create: createComment
        }
      }
    };

    issues.get = get;
    issues.create = create;
    return issues;
  })();

  return {
    like: like,
    fork: fork,
    issues: issues
  }

}


module.exports = Github;