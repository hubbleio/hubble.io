# What Are Streams?

A Stream is a flow of data that can be processed or sent into other streams as it comes in. There are stream producers and stream consumers.

## Readable Streams

A stream producers is known as a readable stream. A readable stream produces occasional data events, each of them containing data chunks (think of a server spitting out a movie, for instance). A readable stream may end, emitting the "end" event. Examples of readable streams are: an HTTP response body, a file, the process standard input, a TCP connection, etc.

Here is an example of a readable stream in Node:

    var fs = require('fs');
    
    var readableStream = fs.createReadStream('/path/to/my/file');
    
    readableStream.on('data', function(data) {
    	console.log('we got some data from the file:', data);
    });

    readableStream.on('end', function() {
    	console.log('The file has ended');
    });

# Writable Streams

A stream consumer or a writable stream is an object that accepts data into it (think of a file we append to). It exposes the "write" method that we can use to write data to. Examples of typical writable streams in Node are: Server HTTP response body, a File which we append to, the process standard output, a TCP connection, etc.

Here is an example of a writable stream in Node:

    var fs = require('fs');

    var writableStream = fs.createWriteStream('/path/to/my/file');

    writableStream.write('Some data');
    writableStream.write('Some more data');

    writableStream.end();

# Flow control

In Node no I/O operation blocks, and writing to a stream (being a file, a network connection or other) doesn't block Node's event loop. If, for instance, we are writing into a network connection and the kernel buffers for that socket are not flushed yet, Node buffers the data for us and informs us of what the buffer status is. That way we can easily decide whether to keep writing (increasing the buffer memory size in your Node process) or to just wait until the kernel buffer has been flushed.

While reading from a stream we can also decide to pause or resume that stream. That way we can  control the stream flow just like a water faucet.

When reading data from a stream and writing it to another there is a classical problem that may occur when the write stream is slower that the read stream. For instance, imagine us serving a large movie via HTTP into a client that has a slow internet connection. Node will keep buffering the data, and if that persists for some time, your buffer memory will continue growing and you will start having problems.

Fortunately there is a way for us to mitigate that problem by using the streams flow control primitives. Here is how writing the data coming from readable stream into a writable stream would be done in Node:

    var readStream = ...;
    var writeStream = ...;

    readStream.on('data', function(data) {

    	var flushed = writeStream.write(data);

    	if (! flushed) {
    		readStream.pause();
    		
    		writeStream.once('drain', function() {
    			readStream.resume();
    		});

    	}
    });

    readStream.on('end', function() {
    	writeStream.end();
    });

Here we have two abstract streams: the `readStream`, which is the stream we are getting data chunks from and the `writeStream`, the stream we are writing those chunks to. Once we get a "data" event with a data chunk, we write that data into the write stream. If that write was immediately flushed, we proceed normally. If not, we have to pause the `readStream` until the `writeStream` buffer is drained. Once it drains we can resume the `readStream`.

# Stream#pipe

This is an easy and nice way of making sure the write stream is not swamped with data it cannot flush. Fortunately Node has camptured this pattern into the core and provides a nice API that does this for us: `Stream#pipe`. Here is how we would do the code above using it:

    var readStream = ...;
    var writeStream = ...;

    readStream.pipe(writeStream);

Even simpler, right?

# Some Examples

## HTTP Server Response and File Read Stream

Let's say we have an HTTP server that is serving a large movie file to each customer. Here is how we would do it using streams in Node:


    var fs = require('fs');

	require('http').createServer(function(req, res) {
		var movie = fs.createReadStream('/path/to/my/movie.mov');
		res.setHeader('Content-Type', 'video/quicktime');
		movie.pipe(res);
	}).listen(8080);

## Piping the Request Body into a File Write Stream

You can also pipe the response to an HTTP request into a file:

    var http = require('http');
	var fs   = require('fs');

	var writeStream = fs.createWriteStream('nodejitsu_logo.png');

	var options = {
		host: 'nodejitsu.com',
		path: '/img/header-logo-grey.png'
	};

	http.request(options, function(res) {
		res.pipe(writeStream);
	}).end();

Here you are opening a file writable stream and then making a request to a nodejitsu server, asking for the nodejitsu logo. When the server response comes in, you pipe it into file.