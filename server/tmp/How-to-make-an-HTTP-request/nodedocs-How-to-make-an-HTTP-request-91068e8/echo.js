var http = require('http');

var options = {
  host: 'echo.nodejitsu.com',
  path: '/',
  //since we are listening on a custom port, we need to specify it by hand
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
    console.log('echo.nodejitsu.com replied:', str);
  });
}

var req = http.request(options, responseCallback);

//This is the data we are posting, it needs to be a string or a buffer
req.write("hello world!");

req.end();