	var http = require('http');

	var options = {
	  host: 'nodejitsu.com',
	  path: '/img/header-logo-grey.png'
	};
	var server = http.createServer(function(req, res) {

	  res.setHeader('Content-Type', 'image/png');

	  function responseCallback(response) {
		response.pipe(res);
	  }

	  http.request(options, responseCallback).end();
	});

	server.listen(8080);