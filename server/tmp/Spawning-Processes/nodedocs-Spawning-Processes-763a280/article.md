# Spawning Processes

If you find yourself wishing you could have your Node.js process start another program for you, then look no further than the `child_process` module.

## Executing an External Process

The simplest way is the "fire, forget, and buffer" method using `child_process.exec`.  It runs your process, buffers its output (up to a default maximum of 200kb), and lets you access it from a callback when it is finished. Let us take a look at an example:

		var childProcess = require('child_process'),
		   ls;

		ls = childProcess.exec('ls -l', function (error, stdout, stderr) {
		 if (error) {
		   console.log(error.stack);
		   console.log('Error code: '+error.code);
		   console.log('Signal received: '+error.signal);
		 }
		 console.log('Child Process STDOUT: '+stdout);
		 console.log('Child Process STDERR: '+stderr);
		});

		ls.on('exit', function (code) {
		 console.log('Child process exited with exit code '+code);
		});

NODE PRO TIP: `error.stack` is a stack trace to the point that the Error object was created.

It should be noted that the `STDERR` of a given process is not exclusively reserved for error messages. Many programs use it as a channel for secondary data instead.  As such, when trying to work with a program that you have not previously spawned as a child process, it can be helpful to start out dumping both `STDOUT` and `STDERR`, as shown above, to avoid any surprises.

While `child_process.exec` buffers the output of the child process for you, it also returns a `ChildProcess` object, Node's way of wrapping a still-running process.  In the example above, since we are using `ls`, a program that will exit immediately regardless, the only part of the `ChildProcess` object worth worrying about is the `on exit` handler.  It is not necessary here - the process will still exit and the error code will still be shown on errors.

## Launching Child Processes

In Node you have the simple `child_process.exec` that launches the process and informs you of the result once the process finishes. This is great for short-lived scripts that you don't need to control. Should you want a child process that lives along-side your own main Node process, you can use `child_process.spawn`.

The ` child_process.spawn` function launches a process and lets you control and communicate with it.

A simple example of such a process would be a UNIX `tail` command, that watches a file for new data and outputs that data into the standard output stream. For instance, if you would like to watch the `/var/log/system.log` file you would launch the following UNIX command:

    $ tail -f /var/log/system.log

Here is how you would do it in Node:

    var spawn = require('child_process').spawn;

    var tail = spawn('tail', ['-f', '/var/log/system.log']);
    
This simply launches the process, but you have no interaction with it. Here is how you could observe the process standard output stream:

    tail.stdout.setEncoding('utf8');

    tail.stdout.on('data', function(data) {
      console.log('tail output:', data);
    });

You can also kill it, for instance, after a minute has gone by:

    setTimeout(function() {
      tail.kill();
    }, 60000);

And be notified that the child process has died:

    tail.on('exit', function(code, signal) {
      console.log('child process has died. Exit code;', code, ', signal:', signal);
    });

## Forking other Node processes

Besides spawning external commands you may be wanting to spawn new Node processes. You can do that with `child_process.fork()`, which also lets you establish a framed communication channel with that process. You just have to provide it with the main module path like this:

    var fork = require('child_process').fork;

	var child = fork(__dirname + '/child.js');

	child.on('message', function(message) {
	  console.log('got message from child:', message);
	});

	child.send('Hello there!');
    
This script is launching a child process from the module `child.js` from the current working directory.

On the child side, the process can receive messages by listening to the "message" event emitted by the `process` object like this:

    process.on('message', function(message) {
	  console.log('got a message from master:', message.toString());
	  process.send({foo: 1, bar: 2});
	});

if you save the master script into a file named "master.js" and the child script into a file named "child.js", and then launch it by:

    $ node master.js

You should see the output:

    got a message from master: Hello there!
    got message from child: { foo: 1, bar: 2 }

Here you can see that the child is sending an object literal to the server and that the server gets it.

> In this channel you can use any message that can be serialized by the function `JSON.stringify`.