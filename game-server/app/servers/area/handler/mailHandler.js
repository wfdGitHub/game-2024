var bearcat = require("bearcat")
var mailHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
}
//获取所有邮件
mailHandler.prototype.getMailList = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getMailList(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//发送邮件
mailHandler.prototype.sendMail = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var title = msg.title
  var text = msg.text
  var atts = msg.atts
  this.areaManager.areaMap[areaId].sendMail(uid,title,text,atts,0,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//领取邮件附件
mailHandler.prototype.gainMailAttachment = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  var id = msg.id
  this.areaManager.areaMap[areaId].gainMailAttachment(uid,index,id,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//阅读邮件
mailHandler.prototype.readMail = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  var id = msg.id
  this.areaManager.areaMap[areaId].readMail(uid,index,id,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//删除邮件
mailHandler.prototype.deleteMail = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  var id = msg.id
  this.areaManager.areaMap[areaId].deleteMail(uid,index,id,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//一键领取
mailHandler.prototype.gainAllMailAttachment = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].gainAllMailAttachment(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//一件删除已读
mailHandler.prototype.deleteAllReadMail = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].deleteAllReadMail(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "mailHandler",
  	func : mailHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};