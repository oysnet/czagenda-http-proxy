var events = require('events'),
    log = require('czagenda-log').from(__filename);
    
var Server = function(host,port) {
  this.host = host;
  this.port = port;
  this.failures = 0;
  this.repeat_failures = 0;
  this.status = Server.AVAILABLE;
}
Server.prototype = new process.EventEmitter();

Server.prototype.setFailed = function (err, res) {
	log.warning('Request failed on '+this.host+':'+this.port,err.message);
  this.failures += 1;
  this.repeat_failures += 1;  
  var wait = this.repeat_failures * 1000;
  if (wait > 30000) {
    wait = 30000;
  }
  setTimeout(function() {
    this.__setStatus(Server.TESTING);
  }.bind(this),wait);
  this.__setStatus(Server.FAILED);
}

Server.prototype.__setStatus = function(status) {
  if(this.status === status) {
    return;
  }
  this.status = status;
  switch(status) {
    case Server.AVAILABLE:
      this.emit('available',this);
      break;
    case Server.FAILED:
      this.emit('failed',this);
      break;
    case Server.TESTING:
      this.emit('testing',this);
      break;
  }
}
Server.prototype.setSuccess = function () {
  //log.info('Request succeed on '+this.host+':'+this.port);
  this.success+=1;
  this._resetStatus();
}

Server.prototype._resetStatus = function () {
  this.repeat_failures = 0;
  this.__setStatus(Server.AVAILABLE);
}

Server.AVAILABLE = 1;
Server.FAILED = 2;
Server.TESTING = 3;

module.exports.Server = Server
