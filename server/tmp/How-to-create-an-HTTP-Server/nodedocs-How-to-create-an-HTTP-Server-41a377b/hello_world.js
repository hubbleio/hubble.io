var http = require('http');

function requestListener (req, res) {
	res.setHeader('Content-Type', 'text/plain');
	res.write('Hello World!');
	res.end();
}

var server = http.createServer();

server.on('request', requestListener);

server.listen(8080, function() {
  var address = server.address();
  console.log('Server listening on', address);
});