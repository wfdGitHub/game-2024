//背包物品系统
var itemCfg = require("../../../../config/gameCfg/item.json")
var special_item = require("../../../../config/gameCfg/special_item.json")
var charactersCfg = require("../../../../config/gameCfg/characters.json")
var shopCfg = require("../../../../config/gameCfg/shop.json")
var chest_awards = require("../../../../config/gameCfg/chest_awards.json")
var chest_cfg = require("../../../../config/gameCfg/chest_cfg.json")
module.exports = function() {
	var self = this
	this.playerBags = {}
	//使用背包物品
	this.useItem = function(otps,cb) {
		if(!itemCfg[otps.itemId] || !itemCfg[otps.itemId].useType){
			cb(false,"item not exist or can't use")
			return
		}
		//判断物品数量是否足够
		otps.value = parseInt(otps.value)
		if(typeof(otps.value) !== "number" || otps.value <= 0){
			cb(false,"value error " + otps.value)
			return
		}
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
		switch(itemCfg[otps.itemId].useType){
			case "partnerExp":
				//伙伴经验丹
				if(!charactersCfg[otps.characterId] || charactersCfg[otps.characterId].characterType != "partner"){
					cb(false,"characterId error : "+otps.characterId)
					return
				}
				var characterInfo = this.getCharacterById(otps.uid,otps.characterId)
				if(!this.players[otps.uid] || !characterInfo){
					cb(false,"character lock : "+otps.characterId)
					return
				}
				if(characterInfo.level >= this.players[otps.uid].characters[self.heroId].level){
					cb(false,"character level limit : "+otps.characterId)
					return
				}
				this.addCharacterEXP(otps.uid,otps.characterId,parseInt(otps.value * itemCfg[otps.itemId].arg) || 0)
				otps.value = -otps.value
				this.addItem(otps,cb)
			break
			case "petExp":
				//宠物经验丹
				var petInfo = this.getPetById(otps.uid,otps.id)
				if(!petInfo){
					cb(false,"id error : "+otps.id)
					return
				}
				if(petInfo.level >= this.players[otps.uid].characters[self.heroId].level){
					cb(false,"character level limit : "+otps.id)
					return
				}
				this.addPetEXP(otps.uid,otps.id,parseInt(otps.value * itemCfg[otps.itemId].arg) || 0)
				otps.value = -otps.value
				this.addItem(otps,cb)
			break
			case "petEgg":
				//宠物蛋
				var arg = itemCfg[otps.itemId].arg
				var strs = arg.split("&")
				var list = []
				var allNumber = 0
				strs.forEach(function(m_str) {
					var m_list = m_str.split(":")
					allNumber += Number(m_list[1])
					list.push({petId : Number(m_list[0]),rand : allNumber})
				})
				var rand = Math.random() * allNumber
				var characterId = list[0].petId
				for(var i = 0;i < list.length;i++){
					if(rand < list[i].rand){
						characterId = list[i].petId
						break
					}
				}
				this.obtainPet(otps.uid,characterId,function(flag,petInfo) {
					if(flag){
						self.addItem({uid : otps.uid,itemId : otps.itemId,value : -1})
					}
					cb(flag,petInfo)
				})
			break
			case "chest":
				//宝箱
				var awards = this.openChestAward(otps.uid,otps.itemId)
				cb(true,awards)
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
	this.addItem = function(otps,cb) {
		var uid = otps.uid
		var itemId = otps.itemId
		var value = otps.value
		var rate = otps.rate || 1
		if(itemCfg[itemId]){
			value = Math.floor(Number(value) * rate) || 1
			itemId = parseInt(itemId)
			if(!itemId){
				console.error("itemId error "+itemId)
				if(cb){
					cb(false,"itemId error "+itemId)
				}
				return
			}
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
			return {type : "item",itemId : itemId,value : value}
		}else if(special_item[itemId]){
			switch(itemId){
				case "exp":
					value = Math.floor(Number(value) * rate) || 1
					self.addCharacterEXP(uid,10001,value,cb)
					return {type : "exp",value : value}
				break
				case "gold":
					value = Math.floor(Number(value) * rate) || 1
					return self.addItem({uid : uid,itemId : 101,value : value},cb)
				break
				case "diamond":
					value = Math.floor(Number(value) * rate) || 1
					return self.addItem({uid : uid,itemId : 102,value : value},cb)
				break
				case "spar":
					value = Math.floor(Number(value) * rate) || 1
					return self.addItem({uid : uid,itemId : 104,value : value},cb)
				break
				case "e":
					//指定装备
					var list = value.toString().split("-")
					var eId = list[0]
					var samsara = list[1]
					var quality = list[2]
					return self.addEquip(uid,eId,samsara,quality,cb)
				break
				case "ec0":
					return self.addRandEquip(uid,value,0,cb)
				break
				case "ec1":
					return self.addRandEquip(uid,value,1,cb)
				break
				case "ec2":
					return self.addRandEquip(uid,value,2,cb)
				break
				case "ec3":
					return self.addRandEquip(uid,value,3,cb)
				break
				case "ec4":
					return self.addRandEquip(uid,value,4,cb)
				break
				case "ec5":
					return self.addRandEquip(uid,value,5,cb)
				break
				case "ev":
					return self.addEVEquip(uid,value,cb)
				break
				case "g":
					//指定宝石
					var list = value.toString().split("-")
					var gId = list[0]
					var level = list[1]
					var count = Number(parseInt(list[2]) * rate) || 1
					return self.addGem(uid,gId,level,count,cb)
				break
				case "gc":
					//当前转生等级+1随机宝石
					value = Math.floor(Number(value) * rate) || 1
					return self.addRandGem(uid,value,cb)
				break
				case "gs":
					//指定转生等级随机宝石
					self.addGsGem(uid,value,cb)
				break
			}
		}else{
			console.error("item not exist : "+itemId)
			if(cb)
				cb(false,"item not exist")
		}
	}
	//增加物品回调
	this.addItemCB = function(uid,itemId,value,cb) {
		if(itemCfg[itemId]){
			this.addBagItem(uid,itemId,value,cb)
		}else{
			console.error("addItem error : "+itemId)
			if(cb)
				cb(false,"itemId error : "+itemId)
		}
	}
	//扣除道具
	this.consumeItems = function(uid,str,rate,cb) {
		var items = []
		var values = []
		var strList = str.split("&")
		if(!rate || parseFloat(rate) != rate || typeof(rate) != "number"){
			rate = 1
		}
		strList.forEach(function(m_str) {
			var m_list = m_str.split(":")
			var itemId = Number(m_list[0])
			var value = Math.floor(Number(m_list[1]) * rate)
			items.push(itemId)
			values.push(value)
		})
		//判断道具是否足够
		self.getBagItemList(uid,items,function(list) {
			for(var i = 0;i < values.length;i++){
				if(list[i] < values[i]){
					cb(false,"item not enough "+items[i]+" "+list[i]+" "+values[i])
					return
				}
			}
			//扣除道具
			for(var i = 0;i < values.length;i++){
				self.addItem({uid : uid,itemId : items[i],value : -values[i]})
			}
			cb(true)
		})
	}
	//解析物品奖励
	this.addItemStr = function(uid,str,rate) {
		var list = str.split("&")
		if(!rate || parseFloat(rate) != rate || typeof(rate) != "number"){
			rate = 1
		}
		var awardList = []
		list.forEach(function(m_str) {
			var m_list = m_str.split(":")
			var itemId = m_list[0]
			var value = m_list[1]
			awardList.push(self.addItem({uid : uid,itemId : itemId,value : value,rate : rate}))
		})
		return awardList
	}
	//商城购买物品
	this.buyShop = function(uid,shopId,count,cb) {
		if(parseInt(shopId) != shopId || parseInt(count) != count){
			cb(false,"args type error")
			return
		}
		var shopInfo = shopCfg[shopId]
		if(!shopInfo){
			cb(false,"shopId error "+shopId)
			return
		}
		self.consumeItems(uid,shopInfo.pc,count,function(flag,err) {
			if(!flag){
				cb(flag,err)
				return
			}
			self.addItemStr(uid,shopInfo.pa,count)
			cb(true,shopInfo.pa)
		})
	}
	//奖励池获取奖励
	this.openChestAward = function(uid,chestId,rate) {
		if(!chest_cfg[chestId] || !chest_cfg[chestId]["randAward"]){
			return []
		}
		var awardMap = []
		var keyMap = []
		var chestStr = chest_cfg[chestId]["randAward"]
		var list = chestStr.split("&")
		var allValue = 0
		list.forEach(function(m_str) {
			var m_list = m_str.split(":")
			var itemId = m_list[0]
			allValue += parseInt(m_list[1])
			awardMap.push(allValue)
			keyMap.push(itemId)
		})
		var str = false
		var rand = Math.random() * allValue
		for(var i in awardMap){
			if(rand < awardMap[i]){
				str = chest_awards[keyMap[i]]["str"]
				break
			}
		}
		if(str){
			return this.addItemStr(uid,str,rate)
		}else{
			return []
		}
	}
}