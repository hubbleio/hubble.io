var nano = require('nano'),
    Sendgrid = require('sendgrid-web'),
    format   = require('util').format;

var requiredProps = ['message'];
var props = requiredProps;

function valid(articleSuggestion, messages) {
  
  function notPresent(attr) {
    var not = ! articleSuggestion[attr];
    if (not) {
      messages.push('Missing ' + attr);
    }
    return not;
  }

  return ! requiredProps.some(notPresent);
}

module.exports = function(config) {

  var sendgrid = new Sendgrid(config.email.sendgrid);

  function validateAndCreate(contact) {
    var res = this.res,
        req = this.req,
        errors = [],
        user = req.session.user
        ;

    if (valid(contact, errors)) {
      sendgrid.send({
        to: config.email.to,
        from: config.email.from,
        subject: "[" + config.title + "] Contact",
        html: [
          '<p>Message from:</p>',
          '<pre>' + format('%j', {
            login: user.login,
            email: user.email,
            url: user.html_url
          }) + '</pre>',
          '<hr />',
          '<p>' + contact.message + '</p>',
          '<hr />'
        ].join('')
      }, function(err) {
        if (err) {
          console.error(err.stack);
          res.writeHead(500);
          return res.end('Error');
        }
        res.writeHead(201);
        return res.end(JSON.stringify({ok: true}));
      });
    } else {
      res.writeHead(406);
      res.end(JSON.stringify({error: errors.join(', ')}));
    }
  }

  return validateAndCreate;
};