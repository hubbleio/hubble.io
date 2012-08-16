module.exports = function(conf, templates, respond) {

  return {

    get: respond(function() {
      return templates('/about.html').call(this);
    })

  };
};