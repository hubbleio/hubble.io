# Handling Multipart-Form Data

Handling form data and file uploads properly is an important and complex problem in HTTP servers.  Doing it by hand would involve parsing streaming binary data, writing it to the file system, parsing out other form data, and several other complex concerns - luckily, only a very few people will need to worry about it on that deep level.  Felix Geisendorfer, one of the Node.js core committers, wrote a library called `node-formidable` that handles all the hard parts for you.  With its friendly API, you can be parsing forms and receiving file uploads in no time.

## Setting up a Server

With `node-formidable` you start off with a regular HTTP server;

    require('http').createServer(function(req, res) {
      res.end('Hello World!');
    }).listen(8080);

This server should deliver an HTML form so we can test the form parser:

		require('http').createServer(function(req, res) {
		  var method = req.method.toLowerCase();
		  if (method === 'get') {
		  	res.setHeader('Content-Type', 'text/html');
		    res.end(
		      '<form action="/" enctype="multipart/form-data" method="post">'+
		      '<input type="text" name="title"><br>'+
		      '<input type="file" name="upload" multiple="multiple"><br>'+
		      '<input type="submit" value="Upload">'+
		      '</form>'
		    );
		  }
		}).listen(8080);

The server now responds with a simple for should the request method be GET.

You can save this script into a file named "server.js" and launch it:

    $ node server.js

If you direct your browser to [http://localhost:8080](http://localhost:8080) you should see a simple form requesting you to input a text field and a file.

## Handling Form Submissions

But first we need to handle the POST method; this is where `node-formidable` comes in play.

First you need to install the `node-formidable` inside the current node_modules folder. You can do this by simply:

    $ npm install formidable

Now you can import the package inside your server script and handle the POST methods:

var formidable = require('formidable');

	var formidable = require('formidable');

	require('http').createServer(function(req, res) {
	  var method = req.method.toLowerCase();
	  if (method === 'get') {
	  	res.setHeader('Content-Type', 'text/html');
	    res.end(
	      '<form action="/" enctype="multipart/form-data" method="post">'+
	      '<input type="text" name="title"><br>'+
	      '<input type="file" name="upload" multiple="multiple"><br>'+
	      '<input type="submit" value="Upload">'+
	      '</form>'
	    );
	  } else if (method === 'post') {
	  	
	  	// Instantiate a new formidable form for processing.      
	    var form = new formidable.IncomingForm();
	    form.parse(req, function(err, fields, files) {
	    	if (err) { throw err; }
	    	console.log('fields:', fields);
	    	console.log('files:', files);
	    	res.end();
	    });

	  }
	}).listen(8080);

Now, when handling a POST message, we do several new things. First we instantiate an incoming for handler provided by `node-formidable` by using `new formidable.IncomingForm()`. Then we ask it to parse the request, providing it a callback function. This callback function gets three arguments.

The first one, as usual, contains an error object should the operation fail.

The second one contains a fields object. This contains a key-value pair of strings for every form input that was not a file.

Then we have the third argument that contains the file objects. In our case it will contain one entry with the file we uploaded. You can then pick that file by moving, copying it or reading its content.

## Testing the Server

Save this script again into a file named "server.js" and then fire it up:

    $ node server.js

Point your browser to [it](http://localhost:8080), fill the form and click on Submit. You should see a response like this:

    { fields: { title: 'Hello' },
    files: 
     { upload: 
        { size: 2207674,
          path: '/tmp/4e50456ac252db47b1b12a183eef78ce',
          name: 'test.jpg',
          type: 'image/jpeg',
          lastModifiedDate: Wed, 08 Feb 2012 14:55:28 GMT,
          _writeStream: [Object],
          length: [Getter],
          filename: [Getter],
          mime: [Getter] } } }

## More

The module `node-formidable` is more powerful than this. It lets you decide the maximum size of the form, keep file extensions, define the upload directory, be informed of progress and lets you add callbacks for each file. You should check out the [`node-formidable` README](https://github.com/felixge/node-formidable#readme) for more information.