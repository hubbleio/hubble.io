var test     = require('tap').test,
    HubbleIO = require('../'),
    request  = require('request'),
    fs       = require('fs')
    ;

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

test('does not start up', function(t) {
  t.throws(function() {
    var hubble = HubbleIO({});
  });
  t.end();
});

test('starts up', function(t) {
  var hubble = HubbleIO(options);
  hubble.start(function() {
    request({uri:'http://localhost:8080/', pool: false}, function(err, res, body) {
      t.notOk(err, 'No error');
      t.equal(res.statusCode, 200);
      t.equal(body, fs.readFileSync(__dirname + '/index.html', 'utf8'));
      hubble.stop(function() {
        t.end();
      });
    });
  });
});