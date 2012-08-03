# How To Create an HTTPS Server

To create an HTTPS server, you need two things: an SSL certificate, and Node's built-in `https` module.

We need to start out with a word about SSL certificates.  Speaking generally, there are two kinds of certificates: those signed by a 'Certificate Authority', or CA, and 'self-signed certificates'.  A Certificate Authority is a trusted source for an SSL certificate, and using a certificate from a CA allows your users to be trust the identity of your website. In most cases, you would want to use a CA-signed certificate in a production environment - for testing purposes, however, a self-signed certicate will do just fine.

## Generating The Key and Certificate

To generate a self-signed certificate, run the following in your shell:

    openssl genrsa -out key.pem
    openssl req -new -key key.pem -out csr.pem
    openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
    rm csr.pem

## Setting Up The Server

This should leave you with two files, `cert.pem` (the certificate) and `key.pem` (the private key). This is all you need for a SSL connection. So now you set up a quick hello world example (the biggest difference between HTTPS and HTTP is the `options` parameter):

    var https = require('https');
    var fs = require('fs');

    var options = {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem')
    };

    var a = https.createServer(options, function (req, res) {
      res.writeHead(200);
      res.end("hello world\n");
    }).listen(8080);

> Note that `fs.readFileSync` - unlike `fs.readFile`, `fs.readFileSync` will block the entire process until it completes.  In this situation, when Node has not yet started up the event loop, it is ok, but don't use synchronous functions inside callbacks, you slow down the event loop, crippling your server.

## Starting Your Server

You can save this script into a file named "server.js" and fire it up by:

    $ node server.js

Now that your server is set up and started, you should be able to get the file with curl:

    $ curl -k https://localhost:8080

or in your browser, by going to [https://localhost:8000](https://localhost:8000).