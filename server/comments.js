var Github = require('./github');

module.exports = function(conf) {
  var issues = Github(conf).issues;

  function get(repo, callback) {
    issues.get(repo, callback);
  }

  function create(repo) {
    console.log(this.req);
    this.res.end();
    return;
    issues.create(repo, title, body, callback);
  }

  function reply(repo, issue, body, callback) {
    issues(issue).comments.create.call(this, body, callback)
  }

  return {
    get: get,
    create: create,
    reply: reply
  }
}