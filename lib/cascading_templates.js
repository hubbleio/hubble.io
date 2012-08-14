var Templates = require('./templates');

module.exports = function(conf, content) {
  var sources = [];

  if (! content) { throw new Error('must have content'); }

  if (conf.override && conf.override.templates) {
    sources.push(Templates(conf, conf.override.templates, content, accessor));
  }
  sources.push(Templates(conf, __dirname + '/../server/templates', content, accessor));

  function accessor(templatePath) {
    var template;
    for (var i = 0; ! template && (i < sources.length); i ++) {
      template = sources[i](templatePath);
    }
    if (! template) {
      throw new Error('Template with path ' + templatePath + ' not found');
    }
    return template;

  }

  return accessor;
};