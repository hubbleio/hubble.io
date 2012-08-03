var http = require('http');
var fs   = require('fs');

var writeStream = fs.createWriteStream('nodejitsu_logo.png');

var options = {
	host: 'nodejitsu.com',
	path: '/img/header-logo-grey.png'
};

http.request(options, function(res) {
	res.pipe(writeStream);
}).end();