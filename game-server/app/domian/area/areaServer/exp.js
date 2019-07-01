var lvexpCfg = require("../../../../config/gameCfg/lv_exp.json")
var samsaraCfg = require("../../../../config/gameCfg/samsara.json")
var charactersCfg = require("../../../../config/gameCfg/characters.json")
var openCfg = require("../../../../config/gameCfg/open.json")
var openMap = {}
for(var i in openCfg){
	if(!openMap[openCfg[i].lv])
		openMap[openCfg[i].lv] = []
	openMap[openCfg[i].lv].push(openCfg[i].key)
}
//经验相关
module.exports = function() {
	//增加角色经验
	this.addCharacterEXP = function(uid,characterId,value,cb) {
		var self = this
		this.incrbyCharacterInfo(uid,characterId,"exp",value,function(flag,curValue) {
			if(flag){
				self.checkUpgrade(uid,characterId)
			}
			if(cb)
				cb(flag,curValue)
		})
	}
	//角色转生
	this.characterSamsara = function(uid,characterId,cb) {
		if(!this.players[uid] || !this.players[uid].characters[this.charactersMap[characterId]]){
			cb(false,"characterId error "+characterId)
			return
		}
		var characterInfo = this.players[uid].characters[this.charactersMap[characterId]]
		var curLv = Number(characterInfo.level)
		if(curLv % 100 !== 0){
			cb(false,"level error "+curLv)
			return
		}
		var proLv = this.players[uid].characters[0].level
		if(characterType != "hero" && curLv >= proLv){
			cb(false,"can't over hero level "+proLv)
			return
		}
		var characterType = charactersCfg[characterId].characterType
		var samsara = Math.floor(((curLv - 1) / 100))
		samsara++
		if(!samsaraCfg[samsara] || !samsaraCfg[samsara][characterType+"_pc"]){
			cb(false,"level error "+curLv)
			return
		}
		var consumeStr = samsaraCfg[samsara][characterType+"_pc"]
		var items = []
		var values = []
		var self = this
		var strList = consumeStr.split("&")
		strList.forEach(function(m_str) {
			var m_list = m_str.split(":")
			var itemId = Number(m_list[0])
			var value = Number(m_list[1])
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
			var notify = {
				"type" : "characterSamsara",
				"characterId" : characterId,
				"curSamsara" : samsara
			}
			self.sendToUser(uid,notify)
			//扣除道具
			for(var i = 0;i < values.length;i++){
				self.addItem(uid,items[i],-values[i])
			}
			//进阶
			self.incrbyCharacterInfo(uid,characterId,"level",1,function(flag,data) {
				if(flag){
					self.checkUpgrade(uid,characterId)
				}
				cb(flag,data)
			})
		})
	}
	//检查升级
	this.checkUpgrade = function(uid,characterId) {
		if(!this.players[uid] || !this.players[uid].characters[this.charactersMap[characterId]]){
			cb(false,"characterId error "+characterId)
			return
		}
		var characterInfo = this.players[uid].characters[this.charactersMap[characterId]]
		var curLv = Number(characterInfo.level)
		var lv = curLv
		var characterType = charactersCfg[characterId].characterType
		var samsara = Math.floor((curLv / 100))
		var expRate = 1
		if(samsara && samsaraCfg[samsara][characterType+"_exp"]){
			expRate = samsaraCfg[samsara][characterType+"_exp"]
		}
		var curExp = Number(characterInfo.exp)
		var exp = curExp
		var proLv = this.players[uid].characters[0].level
		while(lv % 100 !== 0 && exp >= lvexpCfg[lv % 100][characterType] * expRate){
			if(characterType != "hero" && lv >= proLv){
				break
			}
			exp -= lvexpCfg[lv % 100][characterType] * expRate
			lv += 1
		}
		if(lv != curLv){
			this.incrbyCharacterInfo(uid,characterId,"exp",exp - curExp)
			this.incrbyCharacterInfo(uid,characterId,"level",lv - curLv)
			var notify = {
				"type" : "characterUpgrade",
				"characterId" : characterId,
				"oldLv" : curLv,
				"curLv" : lv,
				"exp" : exp
			}
			this.sendToUser(uid,notify)
		    if(characterId === 10001)
		    	this.protagonistUpgrade(uid,curLv,lv)
		}
	}
	//主角升级
	this.protagonistUpgrade = function(uid,oldLv,curLv) {
		var count = curLv - oldLv
		var self = this
		for(var lv = oldLv + 1;lv <= curLv;lv++){
			if(openMap[lv]){
				openMap[lv].forEach(function(key) {
					self.sysOpen(uid,key)
				})
			}
		}
	}
	//功能开启
	this.sysOpen = function(uid,key) {
		switch(key){
			case "partner1":
				this.openPartner(uid,10002)
			break
			case "partner2":
				this.openPartner(uid,10003)
			break
			case "partner3":
				this.openPartner(uid,10004)
			break
			case "partner4":
				this.openPartner(uid,10005)
			break
		}
	}
}