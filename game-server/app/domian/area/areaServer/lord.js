//主公相关
var lord_lv = require("../../../../config/gameCfg/lord_lv.json")
var main_name = "playerInfo"
module.exports = function() {
	var self = this
	var userLords = {}
	//加载主公数据
	this.lordLoad = function(uid,cb) {
		self.getHMObj(uid,main_name,["level","exp"],function(list) {
			userLords[uid] = {
				"level" : Number(list[0]),
				"exp" : Number(list[1])
			}
			cb()
		})
	}
	//移除主公数据
	this.lordUnload = function(uid) {
		delete userLords[uid]
	}
	//改变头像
	this.changeHead = function(uid,id,cb) {
		self.redisDao.db.hget("area:area"+self.oriIds[uid]+":player:"+uid+":heroArchive",id,function(err,data) {
			if(err || !data){
				cb(false,"未获得该英雄")
			}else{
				self.redisDao.db.hset("area:area"+self.oriIds[uid]+":player:"+uid+":playerInfo","head",id,function(flag,data) {
					cb(true)
				})
			}
		})
	}
	//主公获得经验值
	this.addLordExp = function(uid,exp) {
		self.redisDao.db.hincrby("area:area"+self.oriIds[uid]+":player:"+uid+":playerInfo","exp",exp,function(err,value) {
			if(err)
				console.error(err)
			var notify = {
				"type" : "addLordExp",
				"exp" : exp,
				"curExp" : Number(value)
			}
			userLords[uid]["exp"] = notify.curExp
			self.sendToUser(uid,notify)
			self.checkLordUpgrade(uid,Number(value))
		})
	}
	//获取主公等级
	this.getLordLv = function(uid) {
		return userLords[uid]["level"]
	}
	//主公升级检查
	this.checkLordUpgrade = function(uid,exp) {
		level = userLords[uid]["level"]
		let upLv = 0
		let needExp = 0
		let count = 0
		let gold = 0
		while(lord_lv[level + upLv + 1] && exp >= lord_lv[level + upLv]["exp"] && count < 200){
			count++
			exp -= lord_lv[level + upLv]["exp"]
			needExp += lord_lv[level + upLv]["exp"]
			gold += lord_lv[level + upLv]["gold"]
			upLv += 1
		}
		if(upLv){
			self.redisDao.db.hincrby("area:area"+self.oriIds[uid]+":player:"+uid+":playerInfo","level",upLv)
			self.redisDao.db.hincrby("area:area"+self.oriIds[uid]+":player:"+uid+":playerInfo","exp",-needExp)
			self.addItem({uid : uid,itemId : 202,value : gold})
			let notify = {
				"type" : "lordUpgrade",
				"oldLv" : level,
				"upgrade" : upLv,
				"gold" : gold,
				"curExp" : exp
			}
			userLords[uid]["exp"] = exp
			userLords[uid]["level"] += upLv
			self.sendToUser(uid,notify)
			self.taskUpdate(uid,"loadLv",upLv)
		}
	}
}