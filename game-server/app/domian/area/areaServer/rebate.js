var rebate_item = require("../../../../config/gameCfg/rebate_item.json")
var rebate_gold = require("../../../../config/gameCfg/rebate_gold.json")
var rebate_item_limit = require("../../../../config/gameCfg/rebate_item_limit.json")
var limit_begin = 0
var limit_end = 0
//返利活动
module.exports = function() {
	var self = this
	//计算返利活动
	this.rebateDayUpdate = function(uid) {
		var real_day = self.players[uid]["real_day"]
		var curTime = Date.now()
		self.chageLordData(uid,"rmb_day",0)
		self.chageLordData(uid,"real_day",0)
		if(real_day){
			for(var i in rebate_item){
				if(real_day >= rebate_item[i]["rmb"]){
					self.sendMail(uid,rebate_item[i]["mail_title"],rebate_item[i]["mail_text"],rebate_item[i]["award"])
				}else{
					break
				}
			}
			var index = 0
			for(var i in rebate_gold){
				if(real_day >= rebate_gold[i]["rmb"]){
					index = i
				}else{
					break
				}
			}
			if(rebate_gold[index]){
				self.sendMail(uid,rebate_gold[index]["mail_title"],rebate_gold[index]["mail_text"],"202:"+Math.floor(rebate_gold[index]["award"] * real_day))
			}
			if(curTime >= limit_begin && curTime < limit_end){
				for(var i in rebate_item_limit){
					if(real_day >= rebate_item_limit[i]["rmb"]){
						self.sendMail(uid,rebate_item_limit[i]["mail_title"],rebate_item_limit[i]["mail_text"],rebate_item_limit[i]["award"])
					}else{
						break
					}
				}
				self.sendMail(uid,"双节充值返利","亲爱的玩家：这是您的充值返利，祝您游戏愉快！","202:"+Math.floor(2 * real_day))
			}
		}
	}
}