var test = require('tap').test;
var HubbleIO = require('../');

var options = {
  orgname: "nodedocs",
  tagline: "Tag Liine",
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
    hubble.stop(function() {
      t.end();
    });
  });
});