var fs = require('fs');

require('http').createServer(function(req, res) {
	var movie = fs.createReadStream('/path/to/my/movie.mov');
	res.setHeader('Content-Type', 'video/quicktime');
	movie.pipe(res);
}).listen(8080);