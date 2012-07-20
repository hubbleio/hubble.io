var inspect = require('util').inspect;
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
    	res.end(inspect({fields: fields, files: files}));
    });

  }
}).listen(8080);