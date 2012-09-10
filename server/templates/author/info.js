var crypto = require('crypto');

module.exports = function(html, templates, conf, bind, Map, content) {

  var map = Map();

  map.className('avatar').to('author-avatar-url').as('src');
  map.className('author-avatar-link').to('author-link-to').as('href');

  map.className('name').to('name');
  map.className('name').use('url').as('href');

  map.where('role').is('link').to('link');
  map.where('role').is('link-type').use('link-class').as('class');
  map.className('author-link').use('link-url').as('href');
  map.where('role').is('count').to('written_count');

  return function(author) {

    var links = [];
    ['github', 'twitter'].forEach(function(type) {
      if (author.meta[type]) {
        links.push({
            'link-class': type,
            'link-url': author.meta[type]
          });
      }
    });

    var avatarURL;

    if (author.meta.email) {
      var emailHash = crypto.createHash('md5').update(author.meta.email.toLowerCase()).digest('hex');
      avatarURL = '//www.gravatar.com/avatar/' + encodeURIComponent(emailHash);
    }
    if (! avatarURL) {
      if (author.meta.github_info && author.meta.github_info.avatar_url) {
        avatarURL = author.meta.github_info.avatar_url;
      }
    }
    if (! avatarURL) {
      avatarURL = '/img/no_avatar.jpg';
    }


    var data = {
      'author-avatar-url': avatarURL,
      'author-avatar-link': '/authors/' + encodeURIComponent(author.meta.name),
      'name': author.meta.name,
      'url': '/authors/' + encodeURIComponent(author.meta.name),
      'link': links,
      'written_count': author.articles.length
    };

    return bind(html, data, map);
  };
  
};
