//背包系统
var itemCfg = require("../../../../config/gameCfg/item.json")
module.exports = function() {
	this.playerBags = {}
	//使用背包物品
	this.useItem = function(otps,cb) {
		if(!itemCfg[otps.itemId]){
			cb(false,"item not exist")
			return
		}
		//判断物品数量是否足够
		otps.value = parseInt(otps.value)
		if(typeof(otps.value) !== "number" || otps.value <= 0){
			cb(false,"value error " + otps.value)
			return
		}
		var self = this
		self.getBagItem(otps.uid,otps.itemId,function(value) {
			if(otps.value <= value){
				self.useItemCB(otps,cb)
			}else{
				cb(false,"item not enough "+value)
			}
		})
	}
	//使用物品逻辑
	this.useItemCB = function(otps,cb) {
		switch(otps.itemId){
			case 3001:
				//伙伴经验丹
				if((otps.characterId === 10002 || otps.characterId === 10003) && this.players[otps.uid] && this.players[otps.uid].characters[otps.characterId -10001]){
					this.addEXP(otps.uid,otps.characterId,otps.value * 500)
					otps.value = -otps.value
					this.addItem(otps.uid,otps.itemId,otps.value,cb)
				}else{
					cb(false,"characterId error : "+otps.characterId)
				}
			break
			default:
				console.log("itemId can't use "+otps.itemId)
				cb(false,"itemId can't use "+otps.itemId)
		}
	}
	//增加背包物品
	this.addBagItem = function(uid,itemId,value,cb) {
		this.redisDao.db.hincrby("area:area"+this.areaId+":player:"+uid+":bag",itemId,value,function(err,data) {
			if(cb){
				data = Number(data) || 0
				cb(true,data)
			}
		})
	}
	//获取背包物品数量
	this.getBagItem = function(uid,itemId,cb) {
		this.redisDao.db.hget("area:area"+this.areaId+":player:"+uid+":bag",itemId,function(err,data) {
			if(cb){
				data = Number(data) || 0
				cb(data)
			}
		})
	}
	//获取背包
	this.getBagList = function(uid,cb) {
		this.redisDao.db.hgetall("area:area"+this.areaId+":player:"+uid+":bag",function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
}