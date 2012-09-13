module.exports = function(conf, content, templates, respond) {

  return  {

    '/': {

      get: respond(function() {
        return templates('/videos.html').call(this, content.index.videos);
      })
    }
  };

};
