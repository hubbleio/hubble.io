var fs         = require('fs'),
    path       = require('path'),
    Plates     = require('plates'),
    existsSync = path.existsSync || fs.existsSync;

function defaultTemplate(html) {
  return function() {
    return html;
  };
}


function Templates(conf, baseDir, content) {

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

  function templatesAccessor(templateName) {
    var template = templates[templateName];
    if (! template) {
      throw new Error('Template with path ' + templateName + ' not found');
    }
    return template;
  }

  function loadTemplateModule(templatePath) {
    if (existsSync(templatePath)) {
      return require(templatePath);
    } else {
      return defaultTemplate;
    }
  }

  function prepare(templatePath, htmlPath) {
    var html = fs.readFileSync(htmlPath, 'utf8');
    var template = loadTemplateModule(templatePath);
    return template.call(
      templateContext, html, templatesAccessor, conf, templateContext.bind, templateContext.Map, content);
  }

  function addTemplate(baseDir, file) {
    var ext = path.extname(file);
    var htmlFilePath = file.substring(0, file.length - ext.length) + '.html';
    var jsFilePath = file.substring(0, file.length - ext.length) + '.js';
    var htmlFullFilePath = path.join(baseDir, htmlFilePath);
    if (! existsSync(htmlFullFilePath)) {
      throw new Error('Couldn\'t find template file ' + htmlFilePath);
    }
    templates[htmlFilePath] = prepare(path.join(baseDir, jsFilePath), htmlFullFilePath);
  }

  (function scanDir(basePath, dir) {
    fs.readdirSync(dir).forEach(function(file) {
      if (path.extname(file) === '.html') {
        addTemplate(baseDir, path.join(basePath, file));
      } else {
        var newDir = path.join(dir, file);
        if (fs.statSync(newDir).isDirectory()) {
          scanDir(basePath + file + '/', newDir);
        }
      }
    });
  })('/', baseDir);

  return templatesAccessor;
}

module.exports = Templates;