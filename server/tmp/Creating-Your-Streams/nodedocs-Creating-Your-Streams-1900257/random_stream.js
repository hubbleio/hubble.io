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