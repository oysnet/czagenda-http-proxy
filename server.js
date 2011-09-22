var httpProxy = require('http-proxy'),
    servers = require('./lib/servers').Servers,
    log = require('czagenda-log').from(__filename);

servers.set([
  {
    host: '10.7.50.111',
    port: 3000
  },
  {
    host: '10.7.50.118',
    port: 3000
  }
]);

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

