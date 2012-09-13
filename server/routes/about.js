module.exports = function(options) {

  return {

    get: options.respond(function() {
      return options.templates('/about.html').call(this);
    })

  };
};