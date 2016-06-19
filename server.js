"use strict";

import net from "net";
import binary from "binary";
import colors from "colors";

const HOST = "127.0.0.1",
  PORT = 8765;

const COMMANDS = {
  0x01: 'PROTOCOL_VERSION',
  0x65: 'JOYPAD',
  0x68: 'SYNC_AS_MASTER',
  0x69: 'SYNC_AS_SLAVE',
  0x6A: 'SYNC3',
  0x6C: 'STATUS',
  0x6D: 'WANT_DISCONNECT'
}

var clients = [],
  _index = 0;

net.createServer(function(sock) {
  clients.push(sock);
  var index = _index++;

  console.log(('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort).rainbow);

  sock.on('data', function(data) {
    // console.log(sock.remotePort);
    // console.log(data);
    // split buffer into 8-byte packets
    var i,j,buffer,chunk = 8;
    for (i=0,j=data.length; i<j; i+=chunk) {
      buffer = data.slice(i,i+chunk);
      parseBuffer(buffer);
    }
  })

  sock.on('close', function(data) {
    console.log(('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort).red);
  });

  function send(buffer, debug = null, loopback = false) {

    if (loopback) {
      sock.write(buffer);
    } else if (clients.length == 2) {
      if (index == 0) {
        console.log('a')
        clients[1].write(buffer);
      } else {
        console.log('b')
        clients[0].write(buffer);
      }
      console.log(index)
    }
    // sock.write(buffer);
    if (debug) { console.log(debug.green) }
  }

  function parseBuffer(buffer) {

    console.log(buffer)

    switch(COMMANDS[buffer[0]]) {
      case 'PROTOCOL_VERSION':
        send(new Buffer([0x01, 0x01, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00]), 'HANDSHAKE: version check', true)
        break;
      case 'SYNC3':
        // send(buffer, 'SYNC3', true)
        break;
      case 'STATUS':
        send(buffer, 'HANDSHAKE: timing', true)
        break
      case 'JOYPAD':
      case 'SYNC_AS_MASTER':
      case 'SYNC_AS_SLAVE':
      case 'WANT_DISCONNECT':
        break;
      default:
        send(data)
        console.log("unknown data!".red)
    }
    // // <Buffer 68 a0 81 00 42 f3 f6 6a> # received when multiplayer
    // // <Buffer 68 a0 81 00 c6 73 90 79
  }


}).listen(PORT, HOST);
