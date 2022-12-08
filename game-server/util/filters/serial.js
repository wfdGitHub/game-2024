/**
 * Filter to keep request sequence.
 */
var logger = require('pomelo-logger').getLogger('pomelo', __filename);
var taskManager = require('../../app/compose/taskManager');
module.exports = function(app,timeout) {
  return new Filter(app,timeout);
};

var Filter = function(app,timeout) {
  this.app = app
  this.timeout = timeout;
};

/**
 * request serialization after filter
 */
Filter.prototype.before = function(msg, session, next) {
  if(taskManager.checkOver(session.id)){
    // console.log(this.app.areaDeploy,this.app.get("areaDeploy"))
    var serverId = this.app.get("areaDeploy").getServer(session.get("areaId"))
    this.app.rpc.area.areaRemote.kickUser.toServer(serverId,session.uid,null)
    next("504")
  }else{
    taskManager.addTask(session.id, function(task) {
      session.__serialTask__ = task;
      next();
    }, function() {
      logger.error('[serial filter] msg timeout, msg:' + JSON.stringify(msg));
    }, this.timeout);
  }
};

/**
 * request serialization after filter
 */
Filter.prototype.after = function(err, msg, session, resp, next) {
  var task = session.__serialTask__;
  if(task) {
    if(!task.done() && !err) {
      err = new Error('task time out. msg:' + JSON.stringify(msg));
    }
  }
  next(err);
};
