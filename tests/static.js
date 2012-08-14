var test      = require('tap').test,
    Options   = require('../lib/options'),
    Server    = require('../server/server'),
    request   = require('request'),
    fs        = require('fs')
    ;

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

var defaultOptions = {
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

test('static file serving works without cascading', function(t) {
  var content = {},
      options = Options(defaultOptions);

  var server = Server.createServer(options, content, function() {
    request('http://localhost:8080/css/bootstrap.css', function(err, res, body) {
      t.notOk(err);
      t.equal(res.statusCode, 200);
      t.equal(body, fs.readFileSync(__dirname + '/../server/public/css/bootstrap.css', 'utf8'));
      server.close(function() {
        t.end();
      });
    });
  });
});

test('static file serving works with cascading', function(t) {
  var content = {},
      options = clone(defaultOptions)
      ;

  options.override = {
    'static': __dirname
  };
  
  options = Options(options);

  var server = Server.createServer(options, content, function() {
    request('http://localhost:8080/css/bootstrap.css', function(err, res, body) {
      t.notOk(err);
      t.equal(res.statusCode, 200);
      t.equal(body, 'This is boostrap alt.');
      server.close(function() {
        t.end();
      });
    });
  });
});

test('unoverriden static file serving works with cascading enabled', function(t) {
  var content = {},
      options = clone(defaultOptions)
      ;

  options.override = {
    'static': __dirname
  };
  
  options = Options(options);

  var server = Server.createServer(options, content, function() {
    request('http://localhost:8080/css/bootstrap-responsive.css', function(err, res, body) {
      t.notOk(err);
      t.equal(res.statusCode, 200);
      t.equal(body, fs.readFileSync(__dirname + '/../server/public/css/bootstrap-responsive.css', 'utf8'));
      server.close(function() {
        t.end();
      });
    });
  });
});

