var test = require('tap').test;
var Options = require('../lib/options');


test('empty options get invalidated', function(t) {
  t.throws(function() {
    Options();
  }, {name: 'Error', message: 'Options must contain key orgname'});
  t.end();
});

test('empty options get invalidated (2)', function(t) {
  t.throws(function() {
    Options({});
  }, {name: 'Error', message: 'Options must contain key orgname'});
  t.end();
});

test('validate works (1)', function(t) {
  t.throws(function() {
    Options({orgname: "orgname"});
  }, {name: 'Error', message: 'Options must contain key tagline'});
  t.end();
});

test('validate works (2)', function(t) {
  t.throws(function() {
    Options({
      orgname: "orgname",
      tagline: "Tag Liine" });
  }, {name: 'Error', message: 'Options must contain key description'});
  t.end();
});

test('validate works (3)', function(t) {
  t.throws(function() {
    Options({
      orgname: "orgname",
      tagline: "Tag Liine",
      description: "This is a description" });
  }, {name: 'Error', message: 'Options must contain key content'});
  t.end();
});

test('validate works (4)', function(t) {
  t.throws(function() {
    Options({
      orgname: "orgname",
      tagline: "Tag Liine",
      description: "This is a description",
      content: "Coontent"});
  }, {name: 'Error', message: 'Options must contain key content.home'});
  t.end();
});

test('validate works (5)', function(t) {
  t.throws(function() {
    Options({
      orgname: "orgname",
      tagline: "Tag Liine",
      description: "This is a description",
      content: {
        home: "Hoooommeeeee"
      }});
  }, {name: 'Error', message: 'Options must contain key content.home.beginner'});
  t.end();
});

test('validate works (6)', function(t) {
  t.throws(function() {
    Options({
      orgname: "orgname",
      tagline: "Tag Liine",
      description: "This is a description",
      content: {
        home: {
          beginner: 'Yay'
        }
      }});
  }, {name: 'Error', message: 'Options must contain key content.home.intermediate'});
  t.end();
});

test('validate works (7)', function(t) {
  t.throws(function() {
    Options({
      orgname: "orgname",
      tagline: "Tag Liine",
      description: "This is a description",
      content: {
        home: {
          beginner: 'Yay',
          intermediate: 'Yooo'
        }
      }});
  }, {name: 'Error', message: 'Options must contain key content.home.expert'});
  t.end();
});

test('validate works (8)', function(t) {
  t.throws(function() {
    Options({
      orgname: "orgname",
      tagline: "Tag Liine",
      description: "This is a description",
      content: {
        home: {
          beginner: 'Yay',
          intermediate: 'Yooo',
          expert: "woooooo!"
        }
      }});
  }, {name: 'Error', message: 'Options must contain key auth'});
  t.end();
});

test('validate works (9)', function(t) {
  t.throws(function() {
    Options({
      orgname: "orgname",
      tagline: "Tag Liine",
      description: "This is a description",
      content: {
        home: {
          beginner: 'Yay',
          intermediate: 'Yooo',
          expert: "woooooo!"
        }
      },
      auth: 'yay'
    });
  }, {name: 'Error', message: 'Options must contain key auth.github'});
  t.end();
});

test('validate works (10)', function(t) {
  t.throws(function() {
    Options({
      orgname: "orgname",
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
        github: 'wohooo'
      }
    });
  }, {name: 'Error', message: 'Options must contain key auth.github.callback_uri'});
  t.end();
});

test('validate works (11)', function(t) {
  t.throws(function() {
    Options({
      orgname: "orgname",
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
          callback_uri: 'htyeyweyweyw'
        }
      }
    });
  }, {name: 'Error', message: 'Options must contain key auth.github.client_id'});
  t.end();
});

test('validate works (12)', function(t) {
  t.throws(function() {
    Options({
      orgname: "orgname",
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
          client_id: 'daskjdsakjhdaskjdhas'
        }
      }
    });
  }, {name: 'Error', message: 'Options must contain key auth.github.secret'});
  t.end();
});

test('validate works (13)', function(t) {
  t.throws(function() {
    Options({
      orgname: "orgname",
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
      }
    });
  }, {name: 'Error', message: 'Options must contain key email'});
  t.end();
});

test('validate works (14)', function(t) {
  t.throws(function() {
    Options({
      orgname: "orgname",
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
      email: 'yay'
    });
  }, {name: 'Error', message: 'Options must contain key email.sendgrid'});
  t.end();
});

test('validate works (15)', function(t) {
  t.throws(function() {
    Options({
      orgname: "orgname",
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
        sendgrid: "abcbscb"
      }
    });
  }, {name: 'Error', message: 'Options must contain key email.sendgrid.user'});
  t.end();
});

test('validate works (16)', function(t) {
  t.throws(function() {
    Options({
      orgname: "orgname",
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
          user: 'ljdasljdasldkj'
        }
      }
    });
  }, {name: 'Error', message: 'Options must contain key email.sendgrid.key'});
  t.end();
});

test('validate works (17)', function(t) {
  t.throws(function() {
    Options({
      orgname: "orgname",
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
        }
      }
    });
  }, {name: 'Error', message: 'Options must contain key email.to'});
  t.end();
});

test('validate works (17)', function(t) {
  t.throws(function() {
    Options({
      orgname: "orgname",
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
        to: 'ldksajlkajds'
      }
    });
  }, {name: 'Error', message: 'Options must contain key email.from'});
  t.end();
});

test('validate works (18)', function(t) {
  t.doesNotThrow(function() {
    Options({
      orgname: "orgname",
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
    });
  });
  t.end();
});