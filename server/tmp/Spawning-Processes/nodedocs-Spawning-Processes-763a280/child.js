	process.on('message', function(message) {
	  console.log('got a message from master:', message.toString());
	  process.send({foo: 1, bar: 2});
	});