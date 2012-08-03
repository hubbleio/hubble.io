# Serving Static Files

## The Naive Approach

A basic necessity for most HTTP servers is to be able to serve static files. Thankfully, it is not that hard to do in Node. First you find the file, open it and then pipe it to the client response.  Here is an example of a script that will serve the files in the current directory according to :

    var fs = require('fs'),
	    http = require('http');

	http.createServer(function (req, res) {
	  var file = fs.createReadStream(__dirname + req.url);
	  
	  file.on('error', function(err) {
	  	res.writeHead(400);
	  	res.end(err.message);
	  });

	  file.pipe(res);

	}).listen(8080);

The server creates a file readable stream based on the request URL. If there is an error, we simply assume that the file was not found. If not, the file gets successfully piped into the response and both streams are closed when the file end is reached.

You can save this script into a file named "naive_server.js" and fire it up by:

    $ node naive_server.js

You can then point your browser to some files and see the result:

* [http://localhost:8080/naive_server.js](http://localhost:8080/naive_server.js)
* [http://localhost:8080/does_not_exist](http://localhost:8080/does_not_exist)

This example takes the path requested and it serves that path, relative to the local directory. This works fine as a quick solution; however, there are a few problems with this approach. First, this code does not correctly handle mime types, leaving up to the browser to guess what type a response is. Additionally, a proper static file server should really be taking advantage of client side caching, and should send a "Not Modified" response if nothing has changed.  Furthermore, there are security bugs that can enable a malicious user to break out of the current directory. (for example, `GET /../../../some_file`).

## The Better Approach

Each of these can be addressed individually without much difficulty. You can send the proper mime type header. You can figure how to utilize the client caches. You can take advantage of `path.normalize` to make sure that requests don't break out of the current directory. But why write all that code when you can just use someone else's library? 

There is a good static file server called [node-static](https://github.com/cloudhead/node-static) written by Alexis Sellier which you can leverage. Here is a script which functions similarly to the previous one:

    var static = require('node-static');
    var http = require('http');

    var file = new(static.Server)();

    http.createServer(function (req, res) {
      file.serve(req, res);
    }).listen(8080);

This is a fully functional file server that doesn't have any of the bugs previously mentioned. This is just the most basic set up, there are more things you can do if you look at [the api](https://github.com/cloudhead/node-static#readme). Also since it is an open source project, you can always modify it to your needs (and feel free to contribute back to the project!).