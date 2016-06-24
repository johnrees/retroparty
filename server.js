"use strict";

import net from "net";
import binary from "binary";
import colors from "colors";

// http://bgb.bircd.org/bgblink.html

// 1000000 microseconds in a second
// 1000 milliseconds in a second
// 2000000 CPU cycles per second

// new Date().getTime(); <- milliseconds
// multiply time in seconds by 2^21

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
  var epoch = new Date().getTime();

  console.log(epoch);

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
        // console.log('a')
        clients[1].write(buffer);
      } else {
        // console.log('b')
        clients[0].write(buffer);
      }
    }
    // sock.write(buffer);
    if (debug) { console.log(debug.green) }
  }

  function parseBuffer(buffer) {

    // ofs|size|description
    // ---|----|-----------
    // 0  |1   |b1, command
    // 1  |1   |b2
    // 2  |1   |b3
    // 3  |1   |b4
    // 4  |4   |i1, timestamp (little endian)

    // console.log(buffer)

    switch(COMMANDS[buffer[0]]) {
      case 'PROTOCOL_VERSION':
        send(new Buffer([0x01, 0x01, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00]), 'HANDSHAKE: version check', true)
        break;
      case 'SYNC3':
        send(buffer)
        break;
      case 'STATUS':
        // send(buffer, 'HANDSHAKE: timing', true)
        send(new Buffer([0x6C, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), 'HANDSHAKE: version check', true)
        break;
      case 'JOYPAD':
        // ignore
        // console.log("JOYPAD: ignore".red)
        break;
      case 'SYNC_AS_MASTER': // 0x68, expects 0x69 response

        // Send a byte as master. The control value is mostly the SC register, except the addition of the double speed bit.
        // b2=data value.
        // b3=control value.
        //   bit 0: 1
        //   bit 1: high speed
        //   bit 2: double speed
        //   bit 3-6: 0
        //   bit 7: 1
        // b4=0
        // i1=timestamp

        var dataValue = buffer[1];
        var time1 = buffer[4];
        var time2 = buffer[5];
        var time3 = buffer[6];
        var time4 = buffer[7];
        var controlValue = 0x81;

        var buffer2 = new Buffer([0x68, dataValue, controlValue, 0x00, time1, time2, time3, time4]);
        send(buffer2, "Passing on modified 0x68");
        // send(buffer, 'PASS ON 0x68 MESSAGE')
        break;
      case 'SYNC_AS_SLAVE': // 0x69

        // Send a byte as slave. This command is sent in response to receiving a SYNC_AS_MASTER.
        // b2=data value
        // b3=control value, $80
        // b4=0
        // i1=0

        // 69 50 80 00   00 00 00 00
        // 69 50 80 00   00 00 00 00

        // 68 a0 81 00   06 b3 7b 06
        // 69 50 80 01   00 00 00 00

        var dataValue = buffer[1];
        var controlValue = buffer[3];
        var buffer2 = new Buffer([0x69, dataValue, 0x80, controlValue, 0x00, 0x00, 0x00, 0x00]);

        send(buffer2, "Passing on modified 0x69");
        // send(buffer, 'PASS ON 69 MESSAGE')
        break;
      case 'WANT_DISCONNECT':
        break;
      default:
        send(buffer, 'UNKNOWN DATA')
    }
  }

}).listen(PORT, HOST);
