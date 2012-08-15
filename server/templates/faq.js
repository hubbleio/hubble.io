module.exports = function(html, templates) {

  return function() {

    return templates('/layout.html').call(this, {
      main: html,
      title: 'Frequently Asked Questions'
    });
  };
};