//形象相关
var bearcat = require("bearcat")
var showHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//设置头像
showHandler.prototype.changeHead = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].changeHead(uid,msg.id,function(flag,data) {
    if(flag){
        session.set("head",msg.id)
        session.push("head",function() {
          next(null,{flag : true,data : data})
        })
      }else{
        next(null,{flag : false,data : data})
      }
  })
}
//设置形象
showHandler.prototype.changeFigure = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].changeFigure(uid,msg.id,function(flag,data) {
    if(flag){
        session.set("head",msg.id)
        session.push("head",function() {
          next(null,{flag : true,data : data})
        })
      }else{
        next(null,{flag : false,data : data})
      }
  })
}
//获取称号列表
showHandler.prototype.getUserTitleList = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getUserTitleList(uid,function(flag,data) {
  	next(null,{flag : flag,data : data})
  })
}
//获得称号
showHandler.prototype.gainUserTitle = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].gainUserTitle(uid,msg.id,function(flag,data) {
  	next(null,{flag : flag,data : data})
  })
}
//改变称号
showHandler.prototype.changeUserTitle = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].changeUserTitle(uid,msg.id,function(flag,data) {
    if(flag){
        session.set("title",msg.id)
        session.push("title",function() {
          next(null,{flag : true,data : data})
        })
      }else{
        next(null,{flag : false,data : data})
      }
  })
}
//获取头像框列表
showHandler.prototype.getUserFrameList = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getUserFrameList(uid,function(flag,data) {
  	next(null,{flag : flag,data : data})
  })
}
//获得头像框
showHandler.prototype.gainUserFrame = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].gainUserFrame(uid,msg.id,function(flag,data) {
  	next(null,{flag : flag,data : data})
  })
}
//改变头像框
showHandler.prototype.changeUserFrame = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].changeUserFrame(uid,msg.id,function(flag,data) {
    if(flag){
        session.set("frame",msg.id)
        session.push("frame",function() {
          next(null,{flag : true,data : data})
        })
      }else{
        next(null,{flag : false,data : data})
      }
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "showHandler",
  	func : showHandler,
  	args : [{
  		name : "app",
  		value : app
  	}],
    props : []
  })
};