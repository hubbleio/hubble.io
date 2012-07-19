var fs         = require('fs'),
    path       = require('path'),
    Plates     = require('plates'),
    existsSync = path.existsSync || fs.existsSync;

function Templates(conf, baseDir) {

  var templates = {};

  var templateContext = {
    bind: function() {
      return Plates.bind.apply(Plates, arguments);
    },
    Map: function() {
      return new Plates.Map();
    },
    conf: conf
  };

  function templatesAccessor(template) {
    return templates[template];
  }

  function prepare(templatePath, htmlPath) {
    var html = fs.readFileSync(htmlPath, 'utf8');
    var template = require(templatePath);
    return template.call(
      templateContext, html, templatesAccessor, conf, templateContext.bind, templateContext.Map, articles);
  }

  function addTemplate(baseDir, file) {
    var ext = path.extname(file);
    var htmlFilePath = file.substring(0, file.length - ext.length) + '.html';
    var htmlFullFilePath = path.join(baseDir, htmlFilePath);
    if (! existsSync(htmlFullFilePath)) {
      throw new Error('Couldn\'t find template file ' + htmlFilePath);
    }
    templates[htmlFilePath] = prepare(path.join(baseDir, file), htmlFullFilePath);
  }

  (function scanDir(basePath, dir) {
    fs.readdirSync(baseDir).forEach(function(file) {
      if (path.extname(file) === '.js') {
        addTemplate(baseDir, path.join(basePath, file));
      } else {
        if (fs.statSync(path.join(baseDir, basePath, file)).isDirectory()) {
          scanDir(basepath + file + '/', file);
        }
      }
    });
  })('/', baseDir);

  console.log('templates:', templates);

  return templatesAccessor;
}

module.exports = Templates;