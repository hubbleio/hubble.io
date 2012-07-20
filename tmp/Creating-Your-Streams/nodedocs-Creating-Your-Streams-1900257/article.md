# Creating Your Streams

Node has this wonderful abstraction named "Streams". Streams come in two flavours: Readable Streams and Writable Streams. Node has some implementations of these stream interfaces that you have probably already used, like a TCP Connection, an HTTP Client Request or even a File read stream. Besides using them, it is sometimes useful to create your own streaming objects.

Any object can be a Readable or a Writable Stream if it implements the right set of methods and events. Before we learn about them, let's catchup on some underlying conventions in Node regarding the interface these objects should have:

## Readable Streams

An example of a Readable Stream is a video file stream. It will emit that file data stream and it will eventually end. You can pause it and resume it.

## Writable Streams

A Writable Stream is a stream that you can write to. An example of such a stream is a log file you can append to.

On top of letting you write data to it, a Writable Stream should also inform you if the write you did was able to flush the buffers into the destination stream, or if the destination stream was full. This simple mechanism and the fact that you can pause and resume Readable Streams allows Node to do some basic flow control.

## Duplex Streams

A Duplex Stream is a stream that implements both the Readable and the Writable Stream interfaces. Generally, these streams perform some kind of transformation. An example of such a stream is the Node `zlib.Gzip` pseudo-class, which lets you write data to it and that outputs a gzip stream.

## Piping

You can pipe any Readable Stream into another writable stream by using:

```javascript
var sourceReadStream = ...
var targetWriteStream = ...

readStream.pipe(writeStream);
```

On top of writing to the destination every data that it gets on the source stream, pipe also does some basic flow control: if the data written to the destination stream is not flushed, pipe pauses the source stream. Pipe resumes the source stream once the data on the target stream is flushed.

## Implementing a Writable Stream

Any object can be a Writable Stream: it just has to implements a handful of methods and emit some events.

### .writable

First of all, a Writable Stream object must have a property named "writable" set to the boolean value "true". This makes this object viable for piping data to when using the `Stream.prototype.pipe` method.

### .write(buffer, [encoding])

Your Writable Stream should obviously implement the `write` method. The first argument may be a string or a buffer. If it's a string, the second argument may contain the encoding. If it doesn't you should assume the default "utf8" encoding.

If you managed to flush this new buffer out of the Node process, you should return `true`. If not, return `false` to enable the propper flow control mechanisms when piping.

If you returned `false`, you should emit the "drain" once the buffer is flushed out. If you don't, `Stream.prototype.pipe` will assume you are still buffering and will wait indefinitely.

### .end([buffer, [encoding]])

Your stream should be able to end. While ending, a final buffer or string may be passed in to be written, in which case the two arguments should have the same semantics as in the `write` method.

This method should be interpreted as a command to end in the near future and may not happen immediately. For instance, some data may still be buffered and may have to be flushed out before actually closing the underlying resources (if any).

Typically this command is implemented as just a change in object state since the actual cleaning-up can be done in the `.destroy()` method.

### .destroy()

This method will be called by the `Stream.prototype.pipe()` method once the source has emitted the "close" event.
If you need to do some cleanup (like closing a file or a socket), this is where you should do it, but only after all the pending buffers (if any) have been flushed.

### Emit the "close" event

Once the underlying stream (a file or socket, for instance) has been closed you should emit this event.

### Emit the "error" event

Should anything go wrong while writing, transforming or flushing the buffers, you should emit an "error" event like this:

```javascript
this.emit('error', new Error('Something went terribly wrong'));
```

This will enable the stream programatic clients to catch and handle errors gracefully. If there is noone listening to the "error" events, Node will throw an uncaught exception.


## Implementing a Readable Stream

A Readable Stream is mainly an object that emits "data" events.

The best way to start implementing a Readable Stream is to inherit from the Node "stream" module. This module exports the `Stream` constructor so you can derive new pseudo-classes from like this:

```javascript
var inherits = require('util').inherits;
var Stream = require('stream');

function MyReadableStream(options) {
  Stream.call(this);
  this.readable = true;
}

inherits(MyReadableStream, Stream);

MyReadableStream.protoytype.pause = function() {
  // ...
}

// ...
```

This will get your prototype chain setup correctly and inherit the correct pipe behavior.

Now you will have to implement a handful of methods and properties.


### .readable

First of all, a Readable Stream object must have a property named `readable` that has the boolean value "true". This tells `Stream.prototype.pipe()` that this stream implements the Readable Stream interface.


### .setEncoding(encoding)

By default you should emit Buffer objects, but if the encoding gets set, you should emit encoded strings. You should support the official Node encodings: "utf8", "ascii" and "base64".

### Emitting "data" events

What a readable stream mainly does is emit "data" events. You can emit a data events like this:

```javascript
this.emit('data', new Buffer('some string'));
```

Notice that if the object client sets the encoding, you shouuld emit strings, not buffers. A more correct situation for emitting a wrapped string would be this one:

```javascript

MyReadableStream.prototype.setEncoding = function(encoding) {
  this.encoding = encoding;
};

MyReadableStream.prototype.encodeString = function(str) {
  var encoded = new Buffer(str);
  if (this.encoding) {
    encoded = encoded.toString(this.encoding);
  }
  return encoded;
}

MyReadableStream.prototype.emitDataString = function(str) {
  this.emit('data', this.encodeString(str));
};

// ...
this.emitDataString('my UTF-8 string');
```

This code will make sure you have the right string encoding when emitting "data" events. You can further optimize this code for the case where the encoding is already 'utf8':

```javascript
MyReadableStream.prototype.encodeString = function(str) {
  
  if (this.encoding === 'utf8') { return str; }
  
  var encoded = new Buffer(str);
  if (this.encoding) {
    encoded = encoded.toString(this.encoding);
  }
  return encoded;
}

```

On the other hand, if you originally have your data in a Buffer format, you can generally do something like this before emitting:

```javascript
var buf = // some buffer I got
if (this.encoding) { buf = buf.toString(this.encoding); }
this.emit('data', buf);
```

### .pause()

This should make the readable stream not emit any further "data" event before the next call to `.resume()`.

### .resume()

This should unpause your stream, enabling future "data" events to be emitted.

## A Readable Stream Example

Here is an example of a Readable Stream module that emits random buffers at fixed intervals:

```javascript
var Stream = require('stream');
var inherits = require('util').inherits;

function RandomStream(options) {

  Stream.call(this);

  this.readable = true;

  if(! options) { options = {}};
  if (! options.interval) options.interval = 1000; // Defaults to 1 sec
  if (! options.size) options.size = 10; // Defaults to 10 bytes

  this.options = options;

  this.resume();
}

inherits(RandomStream, Stream);

RandomStream.prototype.setEncoding = function(encoding) {
  this.encoding = encoding;
};

RandomStream.prototype.encode = function(buffer) {
  if (this.encoding) {
    buffer = buffer.toString(this.encoding);
  }
  return buffer;
};

RandomStream.prototype.emitRandom = function() {
  var buffer = new Buffer(this.options.size);
  for(var i = 0; i < buffer.length; i ++) {
    buffer[i] = Math.floor(Math.random() * 256);
  }
  this.emit('data', this.encode(buffer));
};


RandomStream.prototype.pause = function() {
  if (this._interval) {
    clearInterval(this._interval);
    delete this._interval;
  }
};

RandomStream.prototype.resume = function() {
  var self = this;

  if (this.ended) { throw new Error('Stream has ended'); }

  if (! this._interval) {
    this._interval =
      setInterval(function() {
        self.emitRandom();
      }, this.options.interval);
  }
};

RandomStream.prototype.end = function(buf) {
  this.ended = true;
  if (buf) { this.write(buf); }
  this.pause();
};

RandomStream.prototype.destroy = function() {
  // do nothing
}

module.exports = RandomStream;
```

You can save this module in a file in the local directory named "random_stream.js" and use it like this:

```javascript
var RandomStream = require('./random_stream');

var randomStream = new RandomStream({interval: 500, size: 20});
randomStream.on('data', console.log);
```

This should start printing out random 20 byte buffers every half a second.