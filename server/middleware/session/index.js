var crypto = require('crypto'),
    inspect = require('util').inspect,
    MemoryStore = require('./memory_store');

var escape = encodeURIComponent;

function uid(len) {
  return crypto.randomBytes(Math.ceil(len * 3 / 4))
    .toString('base64')
    .slice(0, len);
};

function newSessionId() {
  return uid(24);
}

function Session(sessionCookieName, store) {

  sessionCookieName || (sessionCookieName = 'sid');
  store || (store = MemoryStore());

  return function handleRequest(req, res) {
    console.log('handle request');
    var sessionId = req.cookies && req.cookies[sessionCookieName];
    if (! sessionId) { sessionId = newSessionId(); }

    res.setHeader('Set-Cookie', escape(sessionCookieName) + '=' + escape(sessionId));

    store(sessionId, function(err, session) {
      session || (
        session = {
          id: sessionId
        });

      req.session = session;

      res.emit('next');

    });

    res.on('end', function() {
      store(sessionId, req.session, function(err) {
        if (err) { console.error('Error storing session:' + inspect(err)); }
      });
    });

  }
}

module.exports = Session;