/*
 *
 * content.js
 * merges the content from github into the html templates 
 * and creates a repos for it in memory if one does not exist.
 *
 */

var Article = require('./article'),
      Index = require('./index'),
    request = require('request'),
      async = require('async');


function Content(conf, download, callback) {

  var ret = {
    articles: {}
  };

  var apihost = conf.apihost || 'https://api.github.com';
  var orgname = conf.orgname || 'hubbleio';

  //
  // function downloadReposGithubInfo(callback)
  // @option callback {Function} what do once all done.
  //
  function downloadReposGithubInfo(callback) {

    var url = apihost + '/orgs/' + encodeURIComponent(orgname) + '/repos?per_page=10000';

    console.log('[hubble] Putting hubble in orbit around `' + url + '`.');

    request(url, function (err, res, body) {
      if (err) {
        return callback(err);
      }

      //console.log('response from %s:', url, JSON.parse(body));

      if (res.statusCode > 299) {
        return callback(new Error('Github returned status:' + res.statusCode + ' for URL ' + JSON.stringify(url) + '. Body: ' + JSON.stringify(body)));
      }
      
      var cfg = JSON.parse(body);

      var articles = cfg.map(function(repo) {
        var article = ret.articles[repo.name];
        if (! article) {
          article = ret.articles[repo.name] = article = Article(conf, repo.name, repo);
        }
        return article;
      });
      callback(null, articles);
    });
  }

  downloadReposGithubInfo(function(err, articles) {
    if (err) { return callback(err); }
    async.forEach(articles, function(article, next) {
      article.load(download, function(err) {
        if (err) {
          console.error(err.stack);
        }
        next();
      });
    }, function(err) {
      if (err) { return callback(err); }
      Index(conf, articles, function(err, index) {
        ret.index = index;
        callback(err, ret);
      });
    });
  });

}

module.exports = Content;