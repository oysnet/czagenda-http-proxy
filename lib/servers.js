var log = require('czagenda-log').from(__filename);

    
Servers = (function() {
  var servers = [];
  var failed_servers = [];
  function get() {
    var target;
    if(servers.length == 0) {
      if(failed_servers.length>0) {
        log.warning('No up server available, testing with failed server');
        target = failed_servers.shift();
        servers.push(target);  
      } else {
        log.error('No server available');
        target = null;
      }
    } else {
      target = servers.shift();
      servers.push(target);  
    }
    return target;
  }
  
  function set(new_servers) {
    var idx;
    for(var i=0;i<new_servers.length;i++) {
      idx = servers.indexOf(new_servers[i]);
      if(idx === -1)  {
        idx = failed_servers.indexOf(new_servers[i]);
        if(idx === -1)  {
          new_servers[i].failures = 0;
          servers.push(new_servers[i]);
        }
      }
    }
    for(var i=0;i<servers.length;i++) {
      idx = new_servers.indexOf(servers[i]);
      if(idx === -1)  {
         servers.splice(i, 1);
      }
    }
    for(var i=0;i<failed_servers.length;i++) {
      idx = new_servers.indexOf(failed_servers[i]);
      if(idx === -1)  {
         failed_servers.splice(i, 1);
      }
    }
  }
  function succeed(server) {
    var idx = servers.indexOf(server);
    if(idx !== -1)  {
      servers[idx].failures = 0;
    }
  }
  function failed(server) {
    var idx = servers.indexOf(server);
    log.warning('Server error '+server.host+' ('+server.failures+' failures)');
    if(idx !== -1)  {
      var failed_server = servers.splice(idx, 1)[0];
      failed_server.failures += 1;    
      failed_server.retry_after = failed_server.failures * 1000;          
      if(failed_server.retry_after > 30000) {
          failed_server.retry_after = 30000;
      }
      failed_servers.push(failed_server);
      setTimeout(function(server) {
        var idx = failed_servers.indexOf(server);
        if(idx !== -1)  {
          servers.push(failed_servers.splice(idx,1)[0]);
        }    
      }.bind(this,server), failed_server.retry_after);
    }
  }
  
  return {
    get: get,
    set: set,
    failed:failed,
    succeed:succeed
  };
});





exports.Servers = Servers()