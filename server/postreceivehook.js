/*
 *
 * postreceivehook.js
 * when an author commits code to github, github will tell us about
 * what happened with a JSON object that represents a summary of the
 * commit.
 *
 */

var postReceiveHook = exports;

function receive(request, github, callback) {

  //
  // from the request, pull out the repo name so that we can
  // reconstruct a version of `content.html` with the new repo.
  //
  var repo = request.repository.name;
  templates.assets['content.html'].compose(repo, callback);
};

postReceiveHook.on = receive;
