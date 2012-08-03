# How to Stream HTTP Responses

As you may have noticed by now, almost everything is a stream in Node, and an HTTP response is no exception. As the HTTP Server replies with the body content, the body chunks that get received can be handled individually or can be automatically piped into another stream.

## Piping into a File

Say, for instance, that you want to save the Nodejitsu logo into a local file.

    var http = require('http');
	var fs   = require('fs');

	var options = {
	  host: 'nodejitsu.com',
	  path: '/img/header-logo-grey.png'
	};
	var targetFilePath = 'nodejitsu_logo.png';

	function responseCallback(response) {

	  console.log('got response from the server. status:', response.statusCode, ', headers:', response.headers);
	  var targetFile = fs.createWriteStream(targetFilePath);
	  response.pipe(targetFile);

	  response.on('end', function() {
	  	console.log('wrote reply into', targetFilePath);
	  });
	}

	var request = http.request(options, responseCallback);

	request.end();

What we're doing here is: as soon as the server replies, we open a file in write mode, obtaining a writable stream. Then we stream the server response body into that file by using the `sourceStream.pipe(targetStream)` pattern.

If you save this script into a file named 'get_logo.js' and run it:

    $ node get_logo.js

You should get something like this on console output:

    got response from the server. status: 200 , headers: { 'cache-control': 'max-age=3600',
    server: 'node-static/0.5.9',
    etag: '"296662-6525-1323451515000"',
    date: 'Wed, 08 Feb 2012 11:05:18 GMT',
    'last-modified': 'Fri, 09 Dec 2011 17:25:15 GMT',
    'content-length': '6525',
    'content-type': 'image/png',
    connection: 'keep-alive' }
    wrote reply into nodejitsu_logo.png

If you open the file `nodejitsu_logo.png` with an image viewer you should see Nodejitsu the logo there.

## Piping into a Server HTTP Response

You can also easily setup a server which the only objective is to serve the Nodejitsu logo, piped from the Nodejitsu website into the server response:

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

First we are setting up a server and making it listen on port 8080.

Then, on the request handler - which is fired every time we get a new request - we set the content-type header and then make a request to get the Nodejitsu logo. When we get the response from the server we pipe it into the server response.

You can save this file into `pipe_logo_http_server.js` and then fire up the server by:

    $ node pipe_logo_http_server.js

Then make a request to [http://localhost:8080](http://localhost:8080), you should see the Nodejitsu logo there!