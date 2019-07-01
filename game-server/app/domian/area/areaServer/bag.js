//背包物品系统
var itemCfg = require("../../../../config/gameCfg/item.json")
var checkpointsCfg = require("../../../../config/gameCfg/checkpoints.json")
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
				if(checkpointsCfg[otps.characterId].characterType == "partner"){
					if(!(this.players[otps.uid] && this.getCharacterById(otps.uid,otps.characterId))){
						cb(false,"character lock : "+otps.characterId)
						return
					}
					if(this.players[otps.uid].characters[otps.characterId -10001].level >= this.players[otps.uid].characters[0].level){
						cb(false,"character level limit : "+otps.characterId)
						return
					}
					this.addCharacterEXP(otps.uid,otps.characterId,otps.value * 500)
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
	//获取指定物品数量
	this.getBagItemList = function(uid,items,cb) {
		var multiList = []
		for(var i = 0;i < items.length;i++){
			multiList.push(["hget","area:area"+this.areaId+":player:"+uid+":bag",items[i]])
		}
		this.redisDao.multi(multiList,function(err,list) {
			for(var i = 0;i < list.length;i++){
				list[i] = Number(list[i])
			}
			cb(list)
		})
	}
	//增加物品
	this.addItem = function(uid,itemId,value,cb) {
		if(!itemCfg[itemId]){
			if(cb)
				cb(false,"item not exist")
			return
		}
		var self = this
		self.addItemCB(uid,itemId,value,function(flag,curValue) {
			if(flag){
				var notify = {
					"type" : "addItem",
					"itemId" : itemId,
					"value" : value,
					"curValue" : curValue
				}
				self.sendToUser(uid,notify)
			}
			if(cb)
				cb(flag,curValue)
		})
	}
	//增加物品回调
	this.addItemCB = function(uid,itemId,value,cb) {
		if(typeof(itemId) !== "number"){
			cb(false,"type error "+typeof(itemId))
			return
		}
		if(itemCfg[itemId] && itemCfg[itemId].isBag){
			this.addBagItem(uid,itemId,value,cb)
		}else{
			switch(itemId){
				case 100:
					//主角经验
					this.addCharacterEXP(uid,10001,value,cb)
				break
				default:
					console.log("addItem error : "+itemId)
					if(cb)
						cb(false,"itemId error : "+itemId)
			}
		}
	}
	//解析物品奖励
	this.addItemStr = function(uid,str,rate) {
		var list = str.split("&")
		var self = this
		if(!rate){
			rate = 1
		}
		list.forEach(function(m_str) {
			var m_list = m_str.split(":")
			var itemId = Number(m_list[0])
			var value = Math.floor(Number(m_list[1]) * rate)
			self.addItem(uid,itemId,value)
		})
	}
}