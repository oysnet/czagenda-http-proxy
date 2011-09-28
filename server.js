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

/*
var server = httpProxy.createServer(function(req,res,proxy) {
  var target = servers.get();
  function proxyError(err, req,res) {
    console.log(err);
    servers.failed(target);
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    res.end('aie');
  }
  p= proxy.proxyRequest(req, res,target);
  p.removeAllListeners('proxyError');
  p.removeAllListeners('end');
  p.addListener('proxyError', proxyError);
  p.once('end', function(socket,res) {
    if(res.statusCode >= 500) {
      servers.failed(target);
    } else if(res.statusCode < 500) {
      servers.succeed(target);
    }
    p.removeListener('proxyError', proxyError);
  });
});
server.listen(8000);
*/
