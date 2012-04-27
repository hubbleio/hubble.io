var async = require('async'),
    Github = require('./github');

module.exports = function(conf) {
  var issues = Github(conf).issues;

  function get(repo, callback) {
    issues.get(repo, function(err, retIssues) {
      if (err) { return callback(err); }
      async.forEach(retIssues, function(issue, done) {
        issues(repo, issue.number).comments.get(function(err, comments) {
          issue.comments = comments;
          done();
        });
      }, function(err) {
        if (err) { return callback(err); }
        callback(null, retIssues);
      });
    });
  }

  function create(repo, callback) {
    var that = this;
    issues.create.call(this, repo, this.req.body.title, this.req.body.body, function(err) {
      if (err) {
        console.error(err);
        that.res.writeHead(500);
        that.res.end(err.message);
        return;
      }
      callback();
    });
  }

  function reply(repo, issue, body, callback) {
    issues(repo, issue).comments.create.call(this, body, callback)
  }

  return {
    get: get,
    create: create,
    reply: reply
  }
}