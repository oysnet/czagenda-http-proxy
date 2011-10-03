var Servers = require('./lib/servers').Servers,
    Server = require('./lib/server').Server,
    p = require('./lib/proxy').p,
    czdiscovery = require('czagenda-discovery'),
    http = require('http');


var b = new czdiscovery.Browser('http-api');

b.on('up', function(info) {
  Servers.add(new Server(info.host,info.port));
});

b.on('down', function(info) {
  var server = Servers.find(info.host,info.port);
  if(server !== null) {
    Servers.remove(server);
  }
});

var server = http.createServer(function(req,res) {
  p(req,res,servers.get());
});


module.exports = server;

