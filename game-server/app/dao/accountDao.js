var uuid = require("uuid")
const default_cfg = require("../../config/gameCfg/default_cfg.json")
const beginHero = default_cfg["begin_hero"]["value"]
var accountDao = function() {}
//创建新账号
accountDao.prototype.createAccount = function(otps,cb) {
	if(!otps.unionid){
		cb(false,"unionid error "+otps.unionid)
		return
	}
	var userInfo = {
		unionid : otps.unionid,
		head : otps.head || 0,
		limit : 0,
		playTime : 0,
		dayTime : 0,
		freeze : 0,
		dayStr : (new Date()).toLocaleDateString()
	}
	var self = this
	self.redisDao.db.incrby("acc:lastid",1,function(err,accId) {
		if(!err && accId){
			userInfo.accId = accId
			self.redisDao.db.hmset("acc:user:"+userInfo.accId+":base",userInfo)
			//建立映射
			self.redisDao.db.hset("acc:accMap:unionid",userInfo.unionid,userInfo.accId)
			if(!otps.robot){
				self.redisDao.db.hincrby("game:info","accNum",1)
				self.mysqlDao.addDaylyData("accNum",1)
				self.mysqlDao.addRetentionData("accNum",1)
				self.mysqlDao.addLTVData("accNum",1)
			}
			cb(true,userInfo)
		}else{
			cb(false,"createAccount error")
		}
	})
}
//创建机器人账号
accountDao.prototype.createRobotAccount = function(areaId,cb) {
	var self = this
	self.createAccount({unionid : uuid.v1(),head : beginHero,robot:true},function(flag,userInfo) {
		if(flag){
			self.playerDao.createPlayer({accId : userInfo.accId,areaId:areaId,name:self.namespace.getName(),robot:true},function(playerInfo) {
				if(playerInfo){
					self.playerDao.setRobotTeam(areaId,playerInfo)
					var crossUid = areaId+"|"+playerInfo.uid
					self.redisDao.db.zincrby(["cross:grading:rank",10,crossUid],function(err,value) {
						self.redisDao.db.hincrby("game:areaActives",areaId,1)
						self.redisDao.db.zadd(["cross:grading:realRank",10,crossUid])
					})
				}
				if(cb)
					cb(true)
			})
		}
	})
}
accountDao.prototype.updatePlaytime = function(otps) {
	var accId = otps.accId
	var beginTime = otps.beginTime
	var beginStr = (new Date(beginTime)).toLocaleDateString()
	var endTime = Date.now()
	var endStr = (new Date(endTime)).toLocaleDateString()
	var playTime = endTime - beginTime
	this.incrbyAccountData({accId : otps.accId,name : "playTime",value : playTime})
	if(beginStr == endStr){
		//不跨天累计时间
		this.incrbyAccountData({accId : otps.accId,name : "dayTime",value : playTime})
	}else{
		//跨天只取今日时间
		playTime = endTime - new Date(endStr).getTime()
		this.setAccountData({accId : otps.accId,name : "dayTime",value : playTime})
		this.setAccountData({accId : otps.accId,name : "dayStr",value : endStr})
	}
}
//获取账号信息
accountDao.prototype.getAccountInfo = function(otps,cb) {
	var unionid = otps.unionid
	var self = this
	self.redisDao.db.hget("acc:accMap:unionid",unionid,function(err,accId) {
		if(err || !accId){
			cb(false)
		}else{
			self.redisDao.db.hgetall("acc:user:"+accId+":base",function(err,userInfo) {
				if(err || !userInfo){
					cb(false)
				}else{
					var curDayStr = (new Date()).toLocaleDateString()
					if(userInfo.dayStr !== curDayStr){
						userInfo.dayStr = curDayStr
						userInfo.dayTime = 0
						self.redisDao.db.hmset("acc:user:"+userInfo.accId+":base",{"dayStr" : curDayStr,"dayTime" : 0})
					}
					cb(true,userInfo)
				}
			})
		}
	})
}
//获取账号属性
accountDao.prototype.getAccountData = function(otps,cb) {
	var accId = otps.accId
	var name = otps.name
	this.redisDao.db.hget("acc:user:"+accId+":base",name,function(err,data) {
		if(err || !data){
			cb(false)
		}else{
			cb(true,data)
		}
	})
}
//设置账号属性
accountDao.prototype.setAccountData = function(otps,cb) {
	var accId = otps.accId
	var name = otps.name
	var value = otps.value
	this.redisDao.db.hset("acc:user:"+accId+":base",name,value,function(err,data) {
		if(err || !data){
			if(cb)
				cb(false)
		}else{
			if(cb)
				cb(true,data)
		}
	})
}
//设置账号属性
accountDao.prototype.incrbyAccountData = function(otps,cb) {
	var accId = otps.accId
	var name = otps.name
	var value = otps.value
	this.redisDao.db.hincrby("acc:user:"+accId+":base",name,value,function(err,data) {
		if(err || !data){
			if(cb)
				cb(false)
		}else{
			if(cb)
				cb(true,data)
		}
	})
}
module.exports = {
	id : "accountDao",
	func : accountDao,
	props : [{
		name : "redisDao",
		ref : "redisDao"
	},{
		name : "mysqlDao",
		ref : "mysqlDao"
	},{
		name : "playerDao",
		ref : "playerDao"
	},{
		name : "namespace",
		ref : "namespace"
	}]
}