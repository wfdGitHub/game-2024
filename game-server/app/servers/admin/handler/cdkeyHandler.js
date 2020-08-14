var bearcat = require("bearcat")
var cdkeyHandler = function(app) {
	this.app = app
}
//创建礼包码类型
cdkeyHandler.prototype.createCDType = function(msg, session, next) {
	var type = msg.type
	var award = msg.award
	var des = msg.des
	if(typeof(type) != "string" || typeof(award) != "string"){
		next(null,{"err":"参数错误"})
		return
	}
	this.CDKeyDao.createCDType(type,award,des,function(flag,data) {
		next(null,{flag:flag,data:data})
	})
}
//禁用礼包码类型
cdkeyHandler.prototype.pauseCDType = function(msg, session, next) {
	var type = msg.type
	if(typeof(type) != "string"){
		next(null,{"err":"参数错误"})
		return
	}
	this.CDKeyDao.pauseCDType(type,function(flag,data) {
		next(null,{flag:flag,data:data})
	})
}
//恢复礼包码类型
cdkeyHandler.prototype.resumeCDType = function(msg, session, next) {
	var type = msg.type
	if(typeof(type) != "string"){
		next(null,{"err":"参数错误"})
		return
	}
	this.CDKeyDao.resumeCDType(type,function(flag,data) {
		next(null,{flag:flag,data:data})
	})
}
//获取礼包码类型表总页数
cdkeyHandler.prototype.getCDTypePage = function(msg, session, next) {
	this.CDKeyDao.getCDTypePage(function(flag,data) {
		next(null,{flag:flag,data:data})
	})
}
//获取礼包码类型表一页数据
cdkeyHandler.prototype.getCDTypeList = function(msg, session, next) {
	var dataNum = msg.dataNum
	if(typeof(dataNum) != "number"){
		next(null,{"err":"参数错误"})
		return
	}
	this.CDKeyDao.getCDTypeList(dataNum,function(flag,data) {
		next(null,{flag:flag,data:data})
	})
}
//生成礼包码
cdkeyHandler.prototype.createCDKey = function(msg, session, next) {
	var type = msg.type
	var num = msg.num
	var count = msg.count
	var expires = msg.expires
	var key = msg.key
	if(typeof(type) != "string" || typeof(num) != "number" || typeof(expires) != "number"){
		next(null,{"err":"参数错误"})
		return
	}
	this.CDKeyDao.createCDKey(key,type,num,expires,function(flag,data) {
		next(null,{flag:flag,data:data})
	})
}
//获取礼包码数据
cdkeyHandler.prototype.getCDKeyInfo = function(msg, session, next) {
	var key = msg.key
	if(typeof(key) != "string"){
		next(null,{"err":"参数错误"})
		return
	}
	this.CDKeyDao.getCDKeyInfo(key,function(flag,data) {
		next(null,{flag:flag,data:data})
	})
}
module.exports = function(app) {
	return bearcat.getBean({
		id : "cdkeyHandler",
		func : cdkeyHandler,
		args : [{
			name : "app",
			value : app
		}],
		props : [{
			name : "CDKeyDao",
			ref : "CDKeyDao"
		}]
	})
}