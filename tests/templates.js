var test      = require('tap').test,
    Templates = require('../lib/cascading_templates'),
    Content   = require('../lib/content'),
    fs        = require('fs')
    ;

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

var options = {
  orgname: "nodedocs",
  tagline: "Tag Liine",
  title: "dsalçkdsalkdjas",
  description: "This is a description",
  content: {
    home: {
      beginner: 'Yay',
      intermediate: 'Yooo',
      expert: "woooooo!"
    }
  },
  auth: {
    github: {
      callback_uri: 'htyeyweyweyw',
      client_id: 'daskjdsakjhdaskjdhas',
      secret: "adjhasdqwiodyaskjdhaskjhd"
    }
  },
  email: {
    sendgrid: {
      user: 'ljdasljdasldkj',
      key: "hdasiduasliud"
    },
    to: 'ldksajlkajds',
    from: "dsalijdsalidu29"
  }
};

test('works without cascading', function(t) {
  
  var conf = clone(options);
  Content(conf, false, function(err, content) {

    var context = {
      req: {}
    };

    t.notOk(err);
    var templates = Templates(conf, content);
    var result = templates('/layout.html').call(context, conf);
    t.equal(result, fs.readFileSync(__dirname + '/layout.html', 'utf8'));
    t.end();
  });
});

test('works with cascading', function(t) {
  
  var conf = clone(options);
  conf.override = {
    templates: __dirname + '/templates'
  };

  Content(conf, false, function(err, content) {

    var context = {
      req: {}
    };

    t.notOk(err);
    var templates = Templates(conf, content);
    var result = templates('/layout.html').call(context, conf);
    t.equal(result, fs.readFileSync(__dirname + '/layout_overriden.html', 'utf8'));
    t.end();
  });
});
