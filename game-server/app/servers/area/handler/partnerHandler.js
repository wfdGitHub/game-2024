var bearcat = require("bearcat")
var partnerHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};

//伙伴进阶
partnerHandler.prototype.advancedPartner = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var characterId = msg.characterId
  this.areaManager.areaMap[areaId].advancedPartner(uid,characterId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}

module.exports = function(app) {
  return bearcat.getBean({
  	id : "partnerHandler",
  	func : partnerHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
}