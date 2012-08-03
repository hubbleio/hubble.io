var fork = require('child_process').fork;

var child = fork(__dirname + '/child.js');

child.on('message', function(message) {
  console.log('got message from child:', message);
});

child.send('Hello there!');