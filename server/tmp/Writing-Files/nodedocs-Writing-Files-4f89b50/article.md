# Writing Files

Writing to a file is another of the basic programming tasks that one usually needs to know about - luckily, this task is very simple in Node.js.

## Writing The Entire File

We can use the handy `writeFile` method inside the standard library's `fs` module, which can save all sorts of time and trouble.

    fs = require('fs');
    fs.writeFile(filename, data, [encoding], [callback])

`file = (string)` filepath of the file to read

`data = (string or buffer)` the data you want to write to the file

`encoding = (optional string)` the encoding of the `data`. Possible encodings are 'ascii', 'utf8', and 'base64'. If no encoding provided, then 'utf8' is assumed.

`callback = (optional function (err) {})` If there is no error, `err === null`, otherwise `err` contains the error message.

So if we wanted to write "Hello World" to `helloworld.txt`:

    fs = require('fs');
    fs.writeFile('helloworld.txt', 'Hello World!', function (err) {
      if (err) return console.log(err);
      console.log('Hello World > helloworld.txt');
    });

    [contents of helloworld.txt]:
    Hello World!

If we purposely want to cause an error, we can try to write to a file that we don't have permission to access:

    fs = require('fs')
    fs.writeFile('/etc/doesntexist', 'abc', function (err,data) {
      if (err) {
        return console.log(err);
      }
      console.log(data);
    });

    { stack: [Getter/Setter],
      arguments: undefined,
      type: undefined,
      message: 'EACCES, Permission denied \'/etc/doesntexist\'',
      errno: 13,
      code: 'EACCES',
      path: '/etc/doesntexist' }

## Writing To Part of The File

Using the `fs` module you can also be more selective a write into a part of a file. First you have to open the file:

    var fs = require('fs');

    fs.open('/path/to/my/file', 'w', function(err, fd) {
      if (err) { throw err; } // throwing will do for this example code
      console.log('now file is open');
    });

Here we are using the `open` function available in the `fs` module. We pass in a file path and a flag. The `w` flag says we are opening the file in write-only mode. If we wanted to also write to the file we would have to pass `w+`. Next we also pass in a callback function that will fire when the file is open or we have an error.

Once we have the file opened we can write to it in any position. For instance, say that you want to write the string "Hello World!" starting at position 20 in the file, you would do:

    fs.open('/path/to/my/file', 'w', function(err, fd) {

      if (err) { throw err; } // throwing will do for this example code

      var buffer = new Buffer('Hello World!');
      bufferOffset = 0;
      bufferLength = buffer.length;
      filePosition = 20;

      fs.write(fd, buffer, bufferOffset, bufferLength, filePosition, function(err, written, buffer) {
        if (err) { throw err; } // throwing will do for this example code
        console.log('written %d bytes', written);
      });

    });

Here you are using `fs.write`, passing in the file descriptor and the buffer with the content we want to write (`buffer`). We are also passing in the buffer offset we are considering (0 in this case) and the length - in bytes - of the piece we want to write.

Then we pass in a callback function that will be invoked once the writing or an error have occurred. If there is no error, the second argument of that callback will have the actual number of bytes written. You should always validate that argument since it is possible that the actual number of written bytes was less than the number we requested.