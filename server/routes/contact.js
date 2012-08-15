Contact = require('../contact');

module.exports = function(conf, authenticated, templates, respond) {

  var contact = Contact(conf);

  return {

    get: respond(function() {
      return templates('/contact.html').call(this);
    }),

    post: respond(function() {
      contact.call(this, this.req.body);
    })

  };
};