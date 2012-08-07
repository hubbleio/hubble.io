module.exports = function(html, templates, conf, bind, Map, content) {

  return function(parts) {

    if (! Array.isArray(parts)) {
      parts = [parts];
    }
    
    var data = {
      breadcrumb: parts.map(function(part, idx) {
        if (idx < parts.length - 1) {
          return templates('/shared/breadcrumb_part.html').call(this, part);
        } else {
          return templates('/shared/breadcrumb_last_part.html').call(this, part);
        }
      }).join('')
    };
    return bind(html, data);
  };
};