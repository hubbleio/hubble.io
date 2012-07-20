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