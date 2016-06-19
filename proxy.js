'use strict';

var net = require('net');

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
    console.log("LEFT★ > RIGHT")
    console.log(data)
    sock.write(data);
  });

  sock.on('data', function(data) {
    console.log("RIGHT > LEFT★")
    console.log(data)
    client.write(data);
  });

});
