//家园更新
const manor_main = require("../../../../config/gameCfg/manor_main.json")
const main_name = "manor"
const hourTime = 3600000
const truceTime = hourTime * 16
module.exports = function() {
	var self = this
	var local = {}
	//更新
	this.manorCrossUpdate = function(date) {
		local.manorFallCheck()
		local.manorTruceCheck()
	}
	//检查占领状态
	local.manorFallCheck = function() {
		var curTime = Date.now()
		self.redisDao.db.zrange("cross:manorFall",0,5,"WITHSCORES",function(err,list) {
			for(var i = 0;i < list.length;i += 2){
				var uid = Number(list[i])
				var endTime = Number(list[i+1])
				if(curTime > endTime){
					local.manorFallOver(uid)
				}else{
					break
				}
			}
		})
	}
	//检查免战状态
	local.manorTruceCheck = function() {
		var curTime = Date.now()
		self.redisDao.db.zrange("cross:manorTruce",0,5,"WITHSCORES",function(err,list) {
			for(var i = 0;i < list.length;i += 2){
				var uid = Number(list[i])
				var endTime = Number(list[i+1])
				if(curTime > endTime){
					local.manorTruceOver(uid)
				}else{
					break
				}
			}
		})
	}
	//占领结束进入免战状态
	local.manorFallOver = function(uid) {
		self.redisDao.db.zrem("cross:manorFall",uid,function(err,data) {
			if(!err && data){
				var truce = Date.now()+truceTime
				self.redisDao.db.zadd("cross:manorTruce",truce,uid)
				self.setObj(uid,main_name,"truce",truce)
				self.delObj(uid,main_name,"fall")
				self.delObj(uid,main_name,"fallUser")
			}
		})
	}
	//免战结束返回等级列表
	local.manorTruceOver = function(uid) {
		self.getObj(uid,main_name,"main",function(lv) {
			self.redisDao.db.zrem("cross:manorTruce",uid,function(err,data) {
				if(!err && data){
					self.delObj(uid,main_name,"truce")
					self.redisDao.db.sadd("cross:manorLevel:"+lv,uid)
				}
			})
		})
	}
}