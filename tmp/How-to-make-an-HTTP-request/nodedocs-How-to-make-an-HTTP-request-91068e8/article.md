# How to make an HTTP Request
A common programming task is making an HTTP request to a web server.  Node.js provides a simple API for this functionality in the form of `http.request`.

As an example, you are going to preform a GET request to [http://www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new](http://www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new) (which returns a random integer between 1 and 10) and print the result to the console.

    var http = require('http');

    var options = {
      host: 'www.random.org',
      path: '/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
    };

    function responseCallback(response) {
      var retStr = '';
      
      console.log('Got the response from the server. Status:', response.statusCode);

      response.setEncoding('ascii');

      //another chunk of data has been received, so append it to `retStr`
      response.on('data', function (chunk) {
        retStr += chunk;
      });

      //the whole response has been received, so we just print it out here
      response.on('end', function () {
        var retNumber = parseInt(retStr, 10);
        console.log('Got a random number:', retNumber);
      });
    }

    var request = http.request(options);

    request.on('response', responseCallback);

    request.end();

Let's analyze this piece of code:

## The request options

First we prepare the options object literal with the host name and request path. If our target service used a different port from port 80 we could specify it by passing in the `port` option. Also, if we need to, we can send the server some headers by using the `headers` option. We'll cover some of that later.

Then we prepare a callback function (named `responseCallback`) for when the the HTTP server responds. For now you don't really need to understand what it does except that it handles the server response. We will look into the response handler in depth later.

## The Client Request object

Then we create the request object by invoking the `request` function in the "http" module. This function returns an instance of `http.ClientRequest` that we store in the local variable named "request". Besides doing the actual HTTP request for us - sending the request headers to the server - , this object can also send the HTTP request body to the server if we need to: the client request object is also a writable stream that we can write or pipe into. But for now we won't need to use it: we just end that stream by calling `request.end()`, which terminates our request. Now we are ready for the server to reply.

## Processing the server reply

Our request will hit the server, be processed and then replied. When Node receives the server reply it triggers the "response" event on the client request object. Fortunately for us, we had a registered callback on that event -  the `responseCallback` function, which is then called with a new object passed in: the response object, which is an instance of `http.ClientResponse`. This object contains the response headers and HTTP status code. Now we have the response headers from the server, but the response body is not yet available to us. The client response object is itself a readable stream, which means that it emits "data" events as chunks of the response body gets received.

We know, in this case, that the response will be ASCII-encoded, so we set the encoding to that, which means that the data event will emit ASCII-encoded strings instead of raw buffers. Since there may be many "data" events, we have to collect all of them by concatenating them into this final string we store on a variable named "retStr".

Finally, the server response ends, and so the Client Response object emits the "end" event, which we listen to, and take that chance to parse the response number and present it:

    Got the response from the server. Status: 200
    Got a random number: 7

## Making a POST Request

Making a POST request is just as easy. We will make a POST request to `echo.nodejitsu.com` which is running a server that will echo back what we post. The code for making a POST request is almost identical to making a GET request, just a few simple modifications in the options object literal:

    var http = require('http');

    var options = {
      host: 'echo.nodejitsu.com',
      path: '/',
      //This is what changes the request to a POST request
      method: 'POST'
    };

    function responseCallback(response) {
      var str = ''

      response.setEncoding('utf8');

      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        console.log(options.host + ' replied:', str);
      });
    }

    var request = http.request(options, responseCallback);

    //This is the data we are posting, it needs to be a string or a buffer
    request.write("hello world!");

    request.end();

Here we are specifying the HTTP method, since ` http.request` assumes we are making a `GET` request by default, and we want `POST` in this case.

Then we are writing the string "hello world!" "into the client request object, which encodes that string into the HTTP request body.

After we end the request our response handler callback function gets invoked. Now we have to wait for the response body. First we set the respond encoding to UTF-8, which was the encoding we used - Node default encoding for strings written into streams is UTF-8 - and then concatenate all the response body pieces as they arrive. When the request ends we present them.

## Sending Custom Headers

Throwing in custom headers is just a matter of populating the headers option with a object literal with key-value pairs. On `echoheader.nodejitsu.com` we are running a server that will print out the `custom` header.  So we will just make a quick request to it:

    var http = require('http');

    var options = {
      host: 'echoheader.nodejitsu.com',
      path: '/',
      //This is the only line that is new. `headers` is an object with the headers to request
      headers: {'custom': 'Custom Header Demo works'}
    };

    function responseCallback(response) {
      var reply = '';
      response.on('data', function (chunk) {
        reply += chunk;
      });

      response.on('end', function () {
        console.log('Server replied:', reply);
      });
    }

    var request = http.request(options, responseCallback);
    request.end();

You should see printed out:

    Server replied: Custom Header Demo works