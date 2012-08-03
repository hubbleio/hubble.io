# How to Access Query String Parameters

In Node, functionality to aid in the accessing of URL query string parameters is built into the standard library. The built-in `url.parse` method takes care of most of the heavy lifting for us.  Here is an example script using this handy function and an explanation on how it works:

  var http = require('http');
	var url = require('url') ;
	var inspect = require('util').inspect;

	http.createServer(function (req, res) {
	  var queryObject = url.parse(req.url,true).query;
	  res.writeHead(200);
	  res.end(inspect(queryObject));
	}).listen(8080);

The key part of this whole script is this line: `var queryObject = url.parse(req.url,true).query;`. Let's take a look at things from the inside-out.  

First off, `req.url` can look something like `/app.js?foo=bad&baz=foo`. This is the part that is in the URL bar of the browser. Next, it gets passed to `url.parse` which parses out the various elements of the URL (NOTE: the second paramater is a boolean stating whether the method should parse the query string, so we set it to true). Finally, we access the `.query` property, which returns us a nice, friendly Javascript object with our query string data.

We then print back that data to the response.

You can save this script into a file named `server_parse_qs.js` and fire it up:

    $ node server_parse_qs.js

Then you can try out by pointing your browser to [http://localhost:8080](http://localhost:8080) and trying to fiddle with the query string arguments.

* [http://localhost:8080/?a=1&b=abcdef+2](http://localhost:8080/?a=1&b=abcdef+2)
* [http://localhost:8080/big/deep/path?a=1&b=%2Fabcdef+2](http://localhost:8080/big/deep/path?a=1&b=%2Fabcdef+2)

You should see the parsed query string object printed out in the browser on each request that you make.