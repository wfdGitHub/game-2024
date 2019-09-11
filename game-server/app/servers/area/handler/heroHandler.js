var bearcat = require("bearcat")
var heroHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//神器激活
heroHandler.prototype.artifactActivate = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var aId = msg.aId
  this.areaManager.areaMap[areaId].artifactActivate(uid,aId,function(flag,data) {
    next(null,{flag : true,data : data})
  })
}
//神器进阶
heroHandler.prototype.artifactAdvance = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var aId = msg.aId
  this.areaManager.areaMap[areaId].artifactAdvance(uid,aId,function(flag,data) {
    next(null,{flag : true,data : data})
  })
}
//神器升星
heroHandler.prototype.artifactStar = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var aId = msg.aId
  this.areaManager.areaMap[areaId].artifactStar(uid,aId,function(flag,data) {
    next(null,{flag : true,data : data})
  })
}
//穿戴神器
heroHandler.prototype.dressedArtifact = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var aId = msg.aId
  this.areaManager.areaMap[areaId].dressedArtifact(uid,aId,function(flag,data) {
    next(null,{flag : true,data : data})
  })
}
//卸下神器
heroHandler.prototype.takeofArtifact = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var type = msg.type
  this.areaManager.areaMap[areaId].takeofArtifact(uid,type,function(flag,data) {
    next(null,{flag : true,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "heroHandler",
  	func : heroHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
}