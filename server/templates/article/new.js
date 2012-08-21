var moment = require('../../../lib/moment'),
    difficultyLevels = require('../../../lib/difficulty_levels');

module.exports = function(html, templates, conf, bind, Map, content) {

  return function(article) {
    // var data = {
    //   'difficulty-levels': difficultyLevels.strings.map(function(difficultyLevelString) {
    //     return templates('/difficulty_level/dropdown_element.html').call(this, difficultyLevelString);
    //   }).join(''),

    //   'categories': content.index.categories.map(function(category) {
    //     return templates('/category/dropdown_element.html').call(this, category);
    //   }).join('')
    // };
    return html;
  };
  
};