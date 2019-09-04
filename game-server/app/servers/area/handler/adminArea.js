var bearcat = require("bearcat")

var adminArea = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//发放物品
adminArea.prototype.sendItem = function(msg, session, next) {
  var limit = session.get("limit")
  if(!limit || limit < 10){
    next(null,{flag : false})
    return
  }
  var itemId = msg.itemId
  var value = msg.value
  var target = msg.target
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].addItem({uid : target,itemId : itemId,value : value},function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "adminArea",
  	func : adminArea,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};