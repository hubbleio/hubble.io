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