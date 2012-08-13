var nano = require('nano'),
    Sendgrid = require('sendgrid-web');

var database = 'article_requests';
var requiredProps = ['title', 'short-desc', 'content'];
var props = ['title', 'short-desc', 'content'];

function prop(prop) {
  
  return function(o) {
    return o[prop];
  };
}

function valid(articleRequest, messages) {
  
  function notPresent(attr) {
    var not = ! articleRequest[attr];
    if (not) {
      messages.push('Missing ' + attr);
    }
    return not;
  }

  return ! requiredProps.some(notPresent);
}

module.exports = function(config) {

  var db = nano(config.db.url).use(database);
  var sendgrid = new Sendgrid(config.email.sendgrid);

  function validateAndCreate(articleRequest) {
    var res = this.res,
        toInsert = {
          from: this.req.session.user,
          created_at: Date.now(),
          state: 'pending'
        },
        errors = []
    ;
    props.forEach(function(prop) {
      toInsert[prop] = articleRequest[prop];
    });
    if (valid(toInsert, errors)) {
      db.insert(toInsert, function(err, doc) {
        if (err) {
          console.error(err.stack);
          res.writeHead(500);
          return res.end('Error');
        }
        sendgrid.send({
          to: config.email.to,
          from: config.email.from,
          subject: "New Article Request",
          html: config.db.url + '/_utils/document.html?' + database + '/' + doc.id
        }, function(err) {
          if (err) {
            console.error(err.stack);
            res.writeHead(500);
            return res.end('Error');
          }
          res.writeHead(201);
          return res.end(JSON.stringify(doc));
        });
      });
    } else {
      res.writeHead(406);
      res.end(JSON.stringify({error: errors.join(', ')}));
    }
  }

  function getAllForUser(user, callback) {
    (function get() {
      var uri = '_design/views/_view/by_user?key=' + encodeURIComponent(JSON.stringify(user.login));
      db.get(uri, function(err, results) {
        callback(err, results.rows.map(prop('value')));
      });  
    }());
  }

  function get(id, callback) {
    db.get(id, callback);
  }

  return {
    create: validateAndCreate,
    getAllForUser: getAllForUser,
    get: get
  };
};