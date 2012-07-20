	function requestListener (req, res) {
	  res.setHeader('Content-Type', 'text/plain');
	  res.end('Hello World!');
	}	
	server = require('http').createServer(requestListener);
	server.listen(8080, function() {
	  console.log('Server listening on', server.address());
	});