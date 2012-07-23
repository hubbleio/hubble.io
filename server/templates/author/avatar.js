var crypto = require('crypto');

module.exports = function(html, templates, conf, bind, Map, content) {

  return function(author) {

    var map = Map();
    map['class']('avatar').to('avatar_url').as('src');
    map['class']('author-link').to('link_to').as('href');

    var avatarURL;
    if (author.meta.email) {
      var emailHash = crypto.createHash('md5').update(author.meta.email.toLowerCase()).digest('hex');
      avatarURL = '//www.gravatar.com/avatar/' + encodeURIComponent(emailHash);
    } else {
      avatarURL = '/img/no_avatar.jpg';
    }

    var data = {
      link_to: '/contributors/' + encodeURIComponent(author.meta.name),
      avatar_url: avatarURL
    };

    return bind(html, data, map);
  };
  
};