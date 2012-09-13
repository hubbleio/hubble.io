module.exports = function(options) {

  return  {

    '/': {

      get: options.respond(function() {
        return options.templates('/videos.html').call(this, options.content.index.videos);
      })
    }
  };

};
