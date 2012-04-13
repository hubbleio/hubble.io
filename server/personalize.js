var Plates = require('plates'),
    fs     = require('fs');

var template = fs.readFileSync(__dirname + '/../public/assets/user.html', 'utf8');

function personalize(output) {
  var that = this;

  var user = this.req.session.user;

  if (! user) { return output; }

  var userSnippet = Plates.bind(template, user);
  
  var data = {
    signin: userSnippet
  };

  return Plates.bind(output, data);
}

module.exports = personalize;