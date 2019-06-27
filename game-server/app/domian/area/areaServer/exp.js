var lvexpCfg = require("../../../../config/gameCfg/lv_exp.json")
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
	//增加经验
	this.addEXP = function(uid,characterId,value,cb) {
		var self = this
		this.incrbyCharacterInfo(uid,characterId,"exp",value,function(flag,curValue) {
			if(flag){
				self.checkUpgrade(uid,characterId,curValue)
			}
			if(cb)
				cb(flag,curValue)
		})
	}
	//检查升级
	this.checkUpgrade = function(uid,characterId,curValue) {
		var self = this
		var otps = {
			areaId : this.areaId,
			uid : uid,
			characterId : characterId
		}
		self.characterDao.getCharacterInfo(otps,function(flag,characterInfo) {
			if(!flag){
				return
			}
			var oldLv = Number(characterInfo.level)
			var lv = oldLv
			var oldExp = Number(characterInfo.exp)
			var exp = oldExp
			if(!(self.players[uid] && self.players[uid].characters[0] && self.players[uid].characters[0].level)){
				return
			}
			var proLv = self.players[uid].characters[0].level
			var characterType = charactersCfg[characterId].characterType
			while(lvexpCfg[lv] && lvexpCfg[lv][characterType] && exp >= lvexpCfg[lv][characterType]){
				if(characterType != "hero" && lv >= proLv){
					break
				}
				exp -= lvexpCfg[lv][characterType]
				lv += 1
			}
			if(lv != oldLv){
				self.incrbyCharacterInfo(uid,characterId,"exp",exp - oldExp)
				self.incrbyCharacterInfo(uid,characterId,"level",lv - oldLv)
				var notify = {
					"type" : "characterUpgrade",
					"characterId" : characterId,
					"oldLv" : oldLv,
					"curLv" : lv,
					"exp" : exp
				}
				self.channelService.pushMessageByUids('onMessage', notify, [{
			      uid: uid,
			      sid: self.connectorMap[uid]
			    }])
			    if(characterId === 10001)
			    	self.protagonistUpgrade(uid,oldLv,lv)
			}
		})
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
				this.openPartner1(uid)
			break
			case "partner2":
				this.openPartner2(uid)
			break
		}
	}
}