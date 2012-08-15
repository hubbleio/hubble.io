module.exports = function(conf, templates, respond) {

  return {

    get: respond(function() {
      return templates('/faq.html').call(this);
    })

  };
};