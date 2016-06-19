'use strict';

var net = require('net');
var winston = require("winston");

var logger = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)(),
        new(winston.transports.File)({filename: 'logs.log'})
    ]
});


var proxyPort = 4000;
var tcpServerPort = 8765;

var proxy = net.createServer();

proxy.listen(proxyPort);

proxy.on('connection', function(sock) {

  console.log('BGB LEFT★ CONNECTED ' + sock.remoteAddress +':'+ sock.remotePort);

  var client = new net.Socket();
  client.connect(tcpServerPort, function() {
    console.log('CONNECTED TO BGB RIGHT');
  });

  client.on('data', function(data) {
    if (data[0] == 0x68 || data[0] == 0x69) {
      console.log("LEFT★ > RIGHT")
      console.log(data)
    }
    logger.log('info', data, { from: 'master' });
    sock.write(data);
  });

  sock.on('data', function(data) {
    if (data[0] == 0x68 || data[0] == 0x69) {
      console.log("RIGHT > LEFT★")
      console.log(data)
    }
    logger.log('info', data, { from: 'slave' });
    client.write(data);
  });

});
