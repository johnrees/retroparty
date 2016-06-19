var net = require("net"),
  binary = require("binary"),
  colors = require('colors');

var HOST = "127.0.0.1",
  PORT = 8765;

var client = new net.Socket();

var COMMANDS = {
  0x01: 'PROTOCOL_VERSION',
  0x65: 'JOYPAD',
  0x68: 'SYNC_AS_MASTER',
  0x69: 'SYNC_AS_SLAVE',
  0x6A: 'SYNC3',
  0x6C: 'STATUS',
  0x6D: 'WANT_DISCONNECT'
}

client.connect(PORT, HOST, function() {
  console.log(("Connected to " + HOST + ":" + PORT).rainbow)
})

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


function send(buffer, debug) {
  client.write(buffer);
  if (debug) { console.log(debug.green) }
}

function parseBuffer(buffer) {

  switch(COMMANDS[buffer[0]]) {
    case 'PROTOCOL_VERSION':
      send(new Buffer([01, 01, 04, 00, 00, 00, 00, 00]), 'HANDSHAKE: version check')
      break;
    case 'JOYPAD':
      break;
    case 'SYNC_AS_MASTER':
      break;
    case 'SYNC_AS_SLAVE':
      break;
    case 'SYNC3':
      send(buffer, 'SYNC3')
      break;
    case 'STATUS':
      send(buffer, 'HANDSHAKE: timing')
      break
    case 'WANT_DISCONNECT':
      break;
    default:
      console.log("unknown data!".red)
  }
  // // <Buffer 68 a0 81 00 42 f3 f6 6a> # received when multiplayer
  // // <Buffer 68 a0 81 00 c6 73 90 79
}
