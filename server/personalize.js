var Plates = require('plates'),
    fs     = require('fs');

var template = fs.readFileSync(__dirname + '/../public/assets/user.html', 'utf8');

function personalize(output) {
  var that = this;

  var user = this.req.session.user;

  console.log('personalize user:', user);

  if (! user) { return output; }

  var userSnippet = Plates.bind(template, user);
  
  var data = {
    user: userSnippet
  };

  return Plates.bind(output, data);
}

module.exports = personalize;