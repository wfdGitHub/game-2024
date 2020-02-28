//主公相关
var lord_lv = require("../../../../config/gameCfg/lord_lv.json")
module.exports = function() {
	var self = this
	//主公获得经验值
	this.addLordExp = function(uid,exp) {
		self.redisDao.db.hincrby("area:area"+self.areaId+":player:"+uid+":playerInfo","exp",exp,function(err,value) {
			if(err)
				console.error(err)
			var notify = {
				"type" : "addLordExp",
				"exp" : exp,
				"curExp" : Number(value)
			}
			self.sendToUser(uid,notify)
			self.checkLordUpgrade(uid,Number(value))
		})
	}
	//获取主公等级
	this.getLordLv = function(uid,cb) {
		self.redisDao.db.hget("area:area"+self.areaId+":player:"+uid+":playerInfo","level",function(err,level) {
			cb(Number(level)||1)
		})
	}
	//主公升级检查
	this.checkLordUpgrade = function(uid,exp) {
		self.getLordLv(uid,function(level) {
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
				self.redisDao.db.hincrby("area:area"+self.areaId+":player:"+uid+":playerInfo","level",upLv)
				self.redisDao.db.hincrby("area:area"+self.areaId+":player:"+uid+":playerInfo","exp",-needExp)
				self.addItem({uid : uid,itemId : 202,value : gold})
				let notify = {
					"type" : "lordUpgrade",
					"oldLv" : level,
					"upgrade" : upLv,
					"gold" : gold,
					"curExp" : exp
				}
				self.sendToUser(uid,notify)
				self.taskUpdate(uid,"loadLv",upLv)
			}
		})
	}
}