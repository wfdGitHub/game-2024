const gift_list = require("../../../../config/gameCfg/gift_list.json")
const main_name = "limit_gift"
const second_name = "arg_gift"
var gift_lv = {}
var gift_star = {}
var gift_hero = {}
var suddens = {}
for(var i in gift_list){
	switch(gift_list[i]["type"]){
		case "lv":
			gift_lv[gift_list[i]["arg"]] = Object.assign({id:i},gift_list[i]) 
		break
		case "star":
			gift_star[gift_list[i]["arg"]] = Object.assign({id:i},gift_list[i]) 
		break
		case "hero":
			gift_hero[gift_list[i]["arg"]] = Object.assign({id:i},gift_list[i]) 
		break
		case "sudden":
			if(!suddens[gift_list[i]["arg"]])
				suddens[gift_list[i]["arg"]] = []
			suddens[gift_list[i]["arg"]].push(i)
		break
	}
}
//限时礼包
module.exports = function() {
	var self = this
	var local = {}
	//获取限时礼包数据
	this.getLimitGiftData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			if(!data)
				data = {}
			for(var id in data){
				data[id] = Number(data[id])
				if(data[id] < Date.now() - 3600000){
					delete data[id]
					self.delObj(uid,main_name,id)
				}
			}
			cb(true,data)
		})
	}
	//升级检查限时礼包
	this.checkLimitGiftLv = function(uid,oldLv,curLv) {
		for(var i = oldLv + 1;i <= curLv;i++){
			if(gift_lv[i]){
				local.createLimitGift(uid,gift_lv[i]["id"])
			}
		}
	}
	//升星检查限时礼包
	this.checkLimitGiftStar = function(uid,heroId,star) {
		if(star == 6 && gift_hero[heroId]){
			self.getObj(uid,second_name,"hero_"+heroId,function(data) {
				if(!data){
					self.setObj(uid,second_name,"hero_"+heroId,1)
					local.createLimitGift(uid,gift_hero[heroId]["id"])
				}
			})
		}
		if(gift_star[star]){
			self.getObj(uid,second_name,"star_"+star,function(data) {
				if(!data){
					self.setObj(uid,second_name,"star_"+star,1)
					local.createLimitGift(uid,gift_star[star]["id"])
				}
			})
		}
	}
	//检查随机时间突发礼包
	this.checkSuddenGiftForTime = function(uid) {
		self.redisDao.db.hget("player:user:"+uid+":playerData","rand_time",function(err,data) {
			if(data && data != -1){
				if(Date.now() > data){
					self.redisDao.db.hset("player:user:"+uid+":playerData","rand_time",-1)
					self.checkSuddenGift(uid)
				}else{
					console.log("不满足时间要求")
				}
			}
		})
	}
	//检查突发礼包
	this.checkSuddenGift = function(uid) {
		self.getLimitGiftData(uid,function(flag,data) {
			for(var id in data){
				if(gift_list[id]["type"] == "sudden"){
					return
				}
			}
			var rea_rmb = self.getLordAtt(uid,"real_rmb")
			for(var i in suddens){
				if(rea_rmb < i){
					var rand = Math.floor(Math.random() * suddens[i].length)
					local.createLimitGift(uid,suddens[i][rand])
					break
				}
			}
		})
	}
	//生成限时礼包
	local.createLimitGift = function(uid,id) {
		var limitTime = Date.now() + gift_list[id]["time"]
		self.setObj(uid,main_name,id,limitTime)
		var notify = {
			type : "limitGift",
			id : id,
			limitTime : limitTime
		}
		self.sendToUser(uid,notify)
	}
}