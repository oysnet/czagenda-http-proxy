var log = require('czagenda-log').from(__filename),
    Server = require('./server').Server;
   
    
Servers = function() {
  this.available_servers = [];
  this.testing_servers = [];
  this.failed_servers = [];
}

Servers.prototype.add = function(server) {
  if(this.find(server.host,server.port) !== null) {
    log.warn('Attempt to add same server twice');
    return;
  }
  this.available_servers.push(server);
  server.on('failed', function(server) {
    this.__removeFromAll(server)
    this.failed_servers.push(server);
  }.bind(this));
  server.on('available', function(server) {
    this.__removeFromAll(server)
    this.available_servers.push(server);
  }.bind(this));
  server.on('testing', function(server) {
    this.__removeFromAll(server)
    this.testing_servers.push(server);
  }.bind(this));

}

Servers.prototype.__removeFromAll = function(server) {
  var idx = this.available_servers.indexOf(server);
  if( idx !== -1) {
    this.available_servers.splice(idx,1);
  }
  idx = this.testing_servers.indexOf(server);
  if( idx !== -1) {
    this.testing_servers.splice(idx,1);
  }
  idx = this.failed_servers.indexOf(server);
  if( idx !== -1) {
    this.failed_servers.splice(idx,1);
  }
}


Servers.prototype.find = function(host,port) {
  for(var i = 0,l = this.available_servers.length;i<l;i++) {
    if(this.available_servers[i].port === port && this.available_servers[i].host === host) {
      return this.available_servers[i];
    }
  }
  for(var i = 0,l = this.testing_servers.length;i<l;i++) {
    if(this.testing_servers[i].port === port && this.testing_servers[i].host === host) {
      return this.testing_servers[i];
    }
  }
  for(var i = 0,l = this.failed_servers.length;i<l;i++) {
    if(this.failed_servers[i].port === port && this.failed_servers[i].host === host) {
      return this.failed_servers[i];
    }
  }
  return null;

}

Servers.prototype.remove = function(server) {
  this.__removeFromAll(server);
  server.removeAllListeners('failed');
  server.removeAllListeners('available');  
  server.removeAllListeners('testing');  
}
  
Servers.prototype.get = function() {  
  var server = null;
  if(this.testing_servers.length > 0) {
    server = this.testing_servers.shift()
    this.failed_servers.push(server);
  } else if(this.available_servers.length > 0) {
    server = this.available_servers.shift()
    this.available_servers.push(server);
  } else if(this.failed_servers.length > 0) {
    log.error('No server available using failed server');
    server = this.failed_servers.shift()
    this.failed_servers.push(server);
  } else {
    log.error('No server available');
  }
  return server;
}





exports.Servers = new Servers()