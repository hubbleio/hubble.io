# Asynchronous Iteration

Some patterns are hard to grasp, specially when programming asynchronously like you have to when you're doing I/O on Node. For example, let's suppose you had to program the following routine:

> Insert a collection of objects on the database and then, when finished, call a callback.

If you had to write this in a synchronous fashion you would do something like this:

    function insertCollection(collection) {
      for(var i = 0; i < collection.length; i++) {
        db.insert(collection[i]);
      }
    }

## Parallel Execution

Since we are using Node, `db.insert` performs I/O and is therefore asynchronous. We have to turn this into an asynchronous function.

This following implementation is __wrong__:

    function insertCollection(collection, callback) {
      for(var i = 0; i < collection.length; i++) {
        db.insert(collection[i], function(err) {
          if (err) { throw err; }
        });
      }
      callback();
    }

The problem with this one is obvious: `callback` is called right after launching all the `db.inserts` on the background, not leaving them a chance to finish. By the time callback gets called, none of the inserts has terminated.

Another approach (__which is also wrong__) would be this one:

    function insertCollection(collection, callback) {
      for(var i = 0; i < collection.length; i++) {
        (function(i) {
          db.insert(collection[i], function(err) {
            if (err) { return callback(err); }
            if (i == (collection.length - 1)) {
              callback();
            }
          });
        })(i);
      }
    }

There is some temptation to think *we have to call when the last insert calls back*, but this is plain wrong. The first insert can still be executing when the last one callsback. You never know the order in which I/O operations finish.

A safer approach is to do something like this:

    function insertCollection(collection, callback) {
      var inserted = 0;
      for(var i = 0; i < collection.length; i++) {
        db.insert(collection[i], function(err) {
          if (err) {
            return callback(err);
          }
          if (++inserted == collection.length) {
            callback();
          }
        });
      }
    }

You should only callback when __all__ of the inserts have terminated.

This approach is still unsafe, since there is the chance that, if an error occurs, the `callback` function gets called more than once. We should put a guard against that.

Also, we are calling an external function that may throw an error synchronously: we better also guard agains that. A good approach is to centralize the control on a function we can name `done`:

    function insertCollection(collection, callback) {
      var inserted = 0,
          terminated = false;
      
      function done() {
        if (! terminated) {
          terminated = true;
          callback.apply({}, arguments);
        }
      }
      
      for(var i = 0; i < collection.length; i++) {
        try {
          db.insert(collection[i], function(err) {
            if (err) {
              return done(err);
            }
            if (++inserted == collection.length) {
              done();
            }
          });
        } catch(err) {
          done(err);
        }
        
      }
    }

This `done` function assures that we are not invoking the `callback` function more than once.

## Serialized Execution

Sometimes you may need to control the flow and / or the order of the execution. You may want the inserts to be perfectly ordered in this case, or you may want to stop inserting if an error occurs so you can recover more easily. Or you may even want to serialize your database requests so you can spare your database from being hit too hard.

If that's the case, you can do something like this:

    function insertCollection(collection, callback) {
      var coll = collection.slice(0); // clone collection

      (function insertOne() {
        var record = coll.shift(); // get the first record of coll and reduce coll by one
        db.insert(record, function(err) {
          if (err) { return callback(err); }
          if (coll.length == 0) {
            callback();
          } else {
            insertOne();
          }
        }
      })();
    }

Here we are declaring the function `insertOne` and then invoking it immediately after. When an insert is finished we call it again unless we don't have anything else to insert, in which case we callback saying the operation terminated.