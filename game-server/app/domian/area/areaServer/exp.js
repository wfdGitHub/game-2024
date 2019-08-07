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
				self.checkCharacterUpgrade(uid,characterId)
			}
			if(cb)
				cb(flag,curValue)
		})
	}
	//增加宠物经验
	this.addPetEXP = function(uid,id,value,cb) {
		var self = this
		this.incrbyPetInfo(uid,id,"exp",value,function(flag,curValue) {
			if(flag){
				self.checkPetUpgrade(uid,id)
			}
			if(cb)
				cb(flag,curValue)
		})
	}
	//角色转生
	this.characterSamsara = function(uid,characterId,cb) {
		if(!this.players[uid] || !this.players[uid].characters[characterId]){
			cb(false,"characterId error "+characterId)
			return
		}
		var characterInfo = this.players[uid].characters[characterId]
		var curLv = Number(characterInfo.level)
		if(curLv % 100 !== 0){
			cb(false,"level error "+curLv)
			return
		}
		var proLv = this.players[uid].characters[0].level
		var characterType = charactersCfg[characterId].characterType
		if(characterType != "hero" && curLv >= proLv){
			cb(false,"can't over hero level "+proLv)
			return
		}
		var samsara = Math.floor(((curLv - 1) / 100))
		samsara++
		if(!samsaraCfg[samsara] || !samsaraCfg[samsara][characterType+"_pc"]){
			cb(false,"level error "+curLv)
			return
		}
		var consumeStr = samsaraCfg[samsara][characterType+"_pc"]
		var self = this
		self.consumeItems(uid,consumeStr,1,function(flag,err) {
			if(!flag){
				cb(flag,err)
				return
			}
			var notify = {
				"type" : "characterSamsara",
				"characterId" : characterId,
				"curSamsara" : samsara
			}
			self.sendToUser(uid,notify)
			//转生
			self.incrbyCharacterInfo(uid,characterId,"level",1,function(flag,data) {
				if(flag){
					self.checkCharacterUpgrade(uid,characterId)
				}
				cb(flag,data)
			})
		})
	}
	//宠物转生
	this.petSamsara = function(uid,id,cb) {
		if(!this.players[uid] || !this.players[uid].pets[id]){
			cb(false,"id error "+id)
			return
		}
		var characterInfo = this.players[uid].pets[id]
		var curLv = Number(characterInfo.level)
		if(curLv % 100 !== 0){
			cb(false,"level error "+curLv)
			return
		}
		var proLv = this.players[uid].characters[0].level
		var characterType = charactersCfg[characterInfo.characterId].characterType
		if(characterType != "hero" && curLv >= proLv){
			cb(false,"can't over hero level "+proLv)
			return
		}
		var samsara = Math.floor(((curLv - 1) / 100))
		samsara++
		if(!samsaraCfg[samsara] || !samsaraCfg[samsara][characterType+"_pc"]){
			cb(false,"level error "+curLv)
			return
		}
		var consumeStr = samsaraCfg[samsara][characterType+"_pc"]
		var self = this
		self.consumeItems(uid,consumeStr,1,function(flag,err) {
			if(!flag){
				cb(flag,err)
				return
			}
			var notify = {
				"type" : "petSamsara",
				"id" : id,
				"curSamsara" : samsara
			}
			self.sendToUser(uid,notify)
			//转生
			self.incrbyPetInfo(uid,id,"level",1,function(flag,data) {
				if(flag){
					self.checkPetUpgrade(uid,id)
				}
				cb(flag,data)
			})
		})
	}
	//检查角色升级
	this.checkCharacterUpgrade = function(uid,characterId) {
		if(!this.players[uid] || !this.players[uid].characters[characterId]){
			cb(false,"characterId error "+characterId)
			return
		}
		var characterInfo = this.players[uid].characters[characterId]
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
		    if(characterId === 10001)
		    	this.protagonistUpgrade(uid,curLv,lv)
		}
	}
	//检查宠物升级
	this.checkPetUpgrade = function(uid,id) {
		if(!this.players[uid] || !this.players[uid].pets[id]){
			cb(false,"id error "+id)
			return
		}
		var characterInfo = this.players[uid].pets[id]
		var curLv = Number(characterInfo.level)
		var lv = curLv
		var characterType = charactersCfg[characterInfo.characterId].characterType
		var samsara = Math.floor((curLv / 100))
		var expRate = 1
		if(samsara && samsaraCfg[samsara][characterType+"_exp"]){
			expRate = samsaraCfg[samsara][characterType+"_exp"]
		}
		var curExp = Number(characterInfo.exp)
		var exp = curExp
		var proLv = this.players[uid].characters[0].level
		while(lv % 100 !== 0 && exp >= lvexpCfg[lv % 100][characterType] * expRate && lv < proLv){
			exp -= lvexpCfg[lv % 100][characterType] * expRate
			lv += 1
		}
		if(lv != curLv){
			this.incrbyPetInfo(uid,id,"exp",exp - curExp)
			this.incrbyPetInfo(uid,id,"level",lv - curLv)
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
			case "addPetAmount":
				this.addPetAmount(uid)
			break
		}
	}
}