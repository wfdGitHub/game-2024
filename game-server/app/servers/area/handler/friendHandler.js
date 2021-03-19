//好友系统
var bearcat = require("bearcat")
var friendHandler = function(app) {
  	this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//好友列表
friendHandler.prototype.getFriendList = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getFriendList(uid,function(flag,data) {
  	next(null,{flag : flag,data : data})
  })
}
//ID搜索
friendHandler.prototype.searchFriendById = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var target = msg.target
  this.areaManager.areaMap[areaId].searchFriendById(uid,target,function(flag,data) {
  	next(null,{flag : flag,data : data})
  })
}
//换一批好友
friendHandler.prototype.searchFriendBatch = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].searchFriendBatch(function(flag,data) {
  	next(null,{flag : flag,data : data})
  })
}
//申请列表
friendHandler.prototype.getApplyFriendList = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getApplyFriendList(uid,function(flag,data) {
  	next(null,{flag : flag,data : data})
  })
}
//请求添加
friendHandler.prototype.applyAddFriend = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var target = msg.target
  this.areaManager.areaMap[areaId].applyAddFriend(uid,target,function(flag,data) {
  	next(null,{flag : flag,data : data})
  })
}
//同意申请
friendHandler.prototype.agreeAddFriend = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var target = msg.target
  this.areaManager.areaMap[areaId].agreeAddFriend(uid,target,function(flag,data) {
  	next(null,{flag : flag,data : data})
  })
}
//拒绝申请
friendHandler.prototype.refuseAddFriend = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var list = msg.list
  this.areaManager.areaMap[areaId].refuseAddFriend(uid,list,function(flag,data) {
  	next(null,{flag : flag,data : data})
  })
}
//删除好友
friendHandler.prototype.delFriend = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var target = msg.target
  this.areaManager.areaMap[areaId].delFriend(uid,target,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//赠送礼物
friendHandler.prototype.sendFriendGift = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var list = msg.list
  this.areaManager.areaMap[areaId].sendFriendGift(uid,list,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//领取礼物
friendHandler.prototype.gainFriendGift = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var list = msg.list
  this.areaManager.areaMap[areaId].gainFriendGift(uid,list,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "friendHandler",
  	func : friendHandler,
  	args : [{
  		name : "app",
  		value : app
  	}],
    props : []
  })
};