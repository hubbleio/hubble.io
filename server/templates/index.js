module.exports = function(html, templates) {
  return function(html) {
    return templates('/layout.html')(html, {
      title: 'Home'
    });
  };
};