var http = require('http');

var options = {
  host: 'echoheader.nodejitsu.com',
  path: '/',
  //This is the only line that is new. `headers` is an object with the headers to request
  headers: {'custom': 'Custom Header Demo works'}
};

callback = function(response) {
  var str = '';
  response.on('data', function (chunk) {
    str += chunk;
  });

  response.on('end', function () {
    console.log(str);
  });
}

var req = http.request(options, callback);
req.end();