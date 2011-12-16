
//
// create some logic to be routed to.
//

var postrecievehook = exports;

function recieve(repo) {
  this.res.writeHead(200, { 'Content-Type': 'text/plain' });
  this.res.end('postrecieve from (' + route + ')');
}

postrecievehook.on = recieve;
