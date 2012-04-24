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

    console.log('url:', url);

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
        that.res.end(repo.github.watchers.toString());
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
        that.res.end(repo.github.forks.toString());
      }
    });

    var url = githubRepoActionURL(['repos', conf.orgname, repo.github.name, 'forks'], this.req.session);
    //url += '&org=' + escape(this.req.session.user.login);

    request.post(url, b(function(response) {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw new Error('Reply to github fork was status code:' + response.statusCode);
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

  return {
    like: like,
    fork: fork
  }

}


module.exports = Github;