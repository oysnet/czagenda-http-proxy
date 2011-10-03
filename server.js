var Servers = require('./lib/servers').Servers,
    Server = require('./lib/server').Server,
    log = require('czagenda-log').from(__filename),
    p = require('./lib/proxy').p,
    czdiscovery = require('czagenda-discovery');


var b = new czdiscovery.Browser('http-api');

b.on('up', function(info) {
  log.debug("api-http up: ",info.id);
  Servers.add(new Server(info.host,info.port));
});

b.on('down', function(info) {
  log.debug("api-http down: ",info.id);
  var server = Servers.find(info.host,info.port);
  if(server !== null) {
    Servers.remove(server);
  }
});

var http = require('http');
var server = http.createServer(function(req,res) {
  p(req,res,servers.get());
}).listen(8000);
