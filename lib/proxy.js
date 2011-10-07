var http = require('http');
servers = require('./servers').Servers;
var p = function(request, response, proxy) {
	if(proxy === null) {
		response.writeHead(500, {
			'Content-Type' : 'text/plain'
		});
		response.write(' ');
		response.end('no server available');
		return;
	}
	
	var proxy_request = http.request({
		host : proxy.host,
		headers: request.headers,
		port : proxy.port,
		path : request.url,
		method : request.method
	}, function(proxy_response) {
		proxy_response.addListener('data', function(chunk) {
			response.write(chunk, 'binary');
		});
		proxy_response.addListener('end', function() {
			proxy.setSuccess();
			response.end();
		});
	});
	request.addListener('data', function(chunk) {
		proxy_request.write(chunk, 'binary');
	});
	request.addListener('end', function(err, res) {
		proxy_request.end();
	});
	proxy_request.on('error', function(err, res) {
		response.writeHead(500, {
			'Content-Type' : 'text/plain'
		});
		response.write();
		response.end('error');
		proxy.setFailed(err,res);
		response.end();
	});
}
module.exports.p = p
