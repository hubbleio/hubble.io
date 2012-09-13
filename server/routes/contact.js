Contact = require('../contact');

module.exports = function(options) {

  var contact = Contact(options.conf);

  return {

    get: options.respond(function() {
      return options.templates('/contact.html').call(this);
    }),

    post: options.respond(function() {
      contact.call(this, this.req.body);
    })

  };
};