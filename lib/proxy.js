var http = require('http');
servers = require('./servers').Servers;
var p = function (request,response, proxy) {
  var succeed = true;

  var proxy_request = http.request({
      host: proxy.host,
      port: proxy.port,
      path: request.url,
      method: request.method
    }, function (proxy_response) {
      proxy_response.addListener('data', function(chunk) {
        response.write(chunk, 'binary');
      });
      proxy_response.addListener('end', function() {
        response.end();
      });
      response.writeHead(proxy_response.statusCode, proxy_response.headers);
    });
  request.addListener('data', function(chunk) {
    proxy_request.write(chunk, 'binary');
  });
  request.addListener('end', function(err,res) {
    proxy_request.end();
  });
  proxy_request.on('error', function(err,res){
    succeed  = false;
    servers.failed(proxy);
    response.end();
  });
}
module.exports.p = p