var request = require('request'),
    bubble  = require('bubble'),
    escape = encodeURIComponent,
    GITHUB_BASE_URL = 'https://api.github.com'
    ;

function handleResponse(expectedStatusCode, callback) {
  return function(err, resp, body) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    if (resp.statusCode !== expectedStatusCode) {
      try { body = JSON.parse(body); }
      catch(error) {  }
      err = new Error('Github expected response status code is ' + resp.statusCode + 'URL: ' + resp.request.href + ',  body:' + (body && (body.message || body) || ''));
      return callback(err)
    }
    if (typeof body === 'string') {
      try { body = JSON.parse(body); }
      catch(error) { err = error; }
    }
    return callback(err, body);
  }
}

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
                                    conf.orgname,
                                    repo.github.name],
                                  this.req.session);

    request.put(url, handleResponse(204, b(function() {
      
      var url = githubRepoActionURL([ 'repos', conf.orgname, repo.github.name]);
      
      request.get(url, handleResponse(200, b(function(body) {
        repo.github = body;
      })));

    })));

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

      request.get(githubRepoActionURL(['repos', conf.orgname, repo.github.name]), handleResponse(200, b(function(body) {
        repo.github = body;
      })));

    }));


  }

  /******************
   * Issues
   ******************/

  var issues = (function() {

    function get(repo, callback) {
      request.get(githubRepoActionURL([ 'repos', conf.orgname, repo.github.name, 'issues']), handleResponse.call(this, 200, callback));
    }

    function create(repo, title, body, callback) {

      if (! this.req.session.user || ! this.req.session.user.login) {
        this.res.writeHead(403);
        return this.res.end('Please login first');
      }

      var options = {
        uri: githubRepoActionURL(['repos', conf.orgname, repo.github.name, 'issues'], this.req.session),
        json: {
          title: title,
          body: body
        }
      };

      console.log(options);

      request.post(options, handleResponse(201, callback));
    }

    function issues(repo, issue) {

      function createComment(body, callback) {

        if (! this.req.session.user || ! this.req.session.user.login) {
          this.res.writeHead(403);
          return this.res.end('Please login first');
        }

        var url = githubRepoActionURL([ 'repos',
                                        conf.orgname,
                                        repo.github.name,
                                        'issues',
                                        issue,
                                        'comments'],
                                      this.req.session);

        var options = {
          url: url,
          json: { body: body }
        };
        
        request.post(options, handleResponse.call(this, 201, callback));
      }

      function get(callback) {
        var url = githubRepoActionURL([ 'repos',
                                        conf.orgname,
                                        repo.github.name,
                                        'issues',
                                        issue,
                                        'comments']);
        request.get(url, handleResponse(200, callback));
      }

      return {
        comments: {
          get: get,
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