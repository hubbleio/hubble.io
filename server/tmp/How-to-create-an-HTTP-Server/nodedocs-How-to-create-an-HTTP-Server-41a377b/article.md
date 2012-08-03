# How to Create an HTTP Server

Building an HTTP Server in Node is simple. Let's start with the classic "Hello World" HTTP Server:

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

This example is extremely verbose - we could have economized a lot of characters - , but this is better for you to fully understand what is going on.

## Setting Up The Server

First we import the "http" module, which contains the `createServer` function. This function constructs a server object, which is an instance of `http.Server`, which we assign to the local variable named "server".

Then we make the server listen on TCP port 8080. Once it's listening, the callback function we passed as the second argument of server.listen is called, printing out something like this into the console:

    Server listening on { port: 8080, family: 2, address: '0.0.0.0' }

## Processing a Request

Now the server is sitting there ready to serve requests. Every time the server receives a new request, the event "request" gets fired, triggering our registered callback function we named `requestListener`. This function receives two objects: the request object and the response object.

The request object contains information like the request URL and the request headers. It is also a stream for the request body, but we'll cover that later.

The response object is an object that we can set headers and reply with a status code. It is writable stream so we can write to the body content. Once we end that response stream, the response is finished.

Once we get a request, we set a response header with the content type, write "Hello World" to the response body and then end the request.

You can same this server script into a file named "hello_world_server.js" and fire the server up by:

    $ node hello_world_server.js

You can then direct your browser to [http://localhost:8080](http://localhost:8080) to test it.

## Trimming Down Our Example

Once you fully understand it, you can trim down the "Hello World" server script to:

    function requestListener (req, res) {
	  res.setHeader('Content-Type', 'text/plain');
	  res.end('Hello World!');
	}
	
	server = require('http').createServer(requestListener);
	server.listen(8080, function() {
	  console.log('Server listening on', server.address());
	});

First we are passing the `requestListener` function as the first argument of the `http.createServer` function, which is a shortcut for binding it to the "request" event.

Then we are, on the `requestListener` function writing the "Hello World" string inside the `res.end` function, which has the effect of writing it before ending the stream.