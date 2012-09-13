module.exports = function(options) {

  return {

    get: options.respond(function() {
      return options.templates('/faq.html').call(this);
    })

  };
};