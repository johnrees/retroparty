var net = require("net"),
  binary = require("binary"),
  colors = require('colors');

var HOST = "127.0.0.1",
  PORT = 8765;

var client = new net.Socket();

client.connect(PORT, HOST, function() {
  console.log(("Connected to " + HOST + ":" + PORT).rainbow)
})

function parseBuffer(buffer) {
  if (buffer[2] == 4) {
    console.log('HANDSHAKE: version check'.green)
    // var buffer = new Buffer([01, 01, 04, 00, 00, 00, 00, 00]);
    client.write(buffer)
  }

  if (buffer[0] == 0x6C) {
    console.log('HANDSHAKE: timing'.green)
    client.write(buffer)
  }

  if (buffer[0] == 0x6A) {
    console.log('SYNC'.green)
    client.write(buffer)
  }

  // <Buffer 68 a0 81 00 42 f3 f6 6a> # received when multiplayer
  // <Buffer 68 a0 81 00 c6 73 90 79
}

client.on('data', function(data) {
  console.log(data);
  // slice buffer into 8-bit bytes
  var i,j,buffer,chunk = 8;
  for (i=0,j=data.length; i<j; i+=chunk) {
    buffer = data.slice(i,i+chunk);
    parseBuffer(buffer);
  }
})

client.on('close', function() {
  console.log('connection closed')
})
