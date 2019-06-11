var bearcat = require("bearcat")
var fightHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
fightHandler.prototype.mockFight = function(msg, session, next) {
  var atkTeam = msg.atkTeam
  var defTeam = msg.defTeam
  var seededNum = msg.seededNum
  var readList = msg.readList
  if(atkTeam instanceof Array && defTeam instanceof Array){
    var result = this.areaManager.fightContorl.fighting(atkTeam,defTeam,seededNum,readList)
    next(null,{flag : true,result : result})
  }else{
    next(null,{flag : false,err : "args error"})
  }
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "fightHandler",
  	func : fightHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};