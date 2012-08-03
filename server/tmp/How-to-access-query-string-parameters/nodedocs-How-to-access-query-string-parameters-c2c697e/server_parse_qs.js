var http = require('http');
var url = require('url') ;
var inspect = require('util').inspect;

http.createServer(function (req, res) {
  var queryObject = url.parse(req.url,true).query;
  res.writeHead(200);
  res.end(inspect(queryObject));
}).listen(8080);