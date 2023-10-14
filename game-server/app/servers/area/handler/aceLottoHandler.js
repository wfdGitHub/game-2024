var bearcat = require("bearcat")
var aceLottoHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//宝物合成
aceLottoHandler.prototype.compoundAce = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].compoundAce(uid,msg.aId1,msg.aId2,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "aceLottoHandler",
  	func : aceLottoHandler,
  	args : [{
  		name : "app",
  		value : app
  	}],
    props : [{
      name : "heroDao",
      ref : "heroDao"
    }]
  })
};