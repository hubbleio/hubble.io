module.exports = function(html, templates, conf, bind, Map, content) {

  return function(parts) {

    if (! Array.isArray(parts)) {
      parts = [parts];
    }

    var accumulatedPath = [];
    
    var data = {
      breadcrumb: parts.map(function(part, idx) {
        if ('string' === typeof part) {
          accumulatedPath.push(part);
          part = {
            url: '/categories/' + accumulatedPath.join('--'),
            label: part
          };
        }
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