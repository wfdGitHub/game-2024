//天书系统
var bearcat = require("bearcat")
var bookHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取天书数据
bookHandler.prototype.getBookData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getBookData(uid,function(flag,data) {
    next(null,{flag:flag,data:data||{}})
  })
}
//激活天书
bookHandler.prototype.activateBook = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var bookType = msg.bookType
  this.areaManager.areaMap[areaId].activateBook(uid,bookType,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//升级天书
bookHandler.prototype.upgradeBookLv = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var bookType = msg.bookType
  this.areaManager.areaMap[areaId].upgradeBookLv(uid,bookType,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//升星天书
bookHandler.prototype.upgradeBookStar = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var bookType = msg.bookType
  this.areaManager.areaMap[areaId].upgradeBookStar(uid,bookType,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//重生天书
bookHandler.prototype.resetBook = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var bookType = msg.bookType
  this.areaManager.areaMap[areaId].resetBook(uid,bookType,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//设置上阵天书
bookHandler.prototype.setBookFight = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var list = msg.list
  this.areaManager.areaMap[areaId].setBookFight(uid,list,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取上阵天书
bookHandler.prototype.getFightBook = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getFightBook(uid,function(flag,data) {
    next(null,{flag:flag,data:data||{}})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "bookHandler",
  	func : bookHandler,
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