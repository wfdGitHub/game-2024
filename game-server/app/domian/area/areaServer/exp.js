var lvexpCfg = require("../../../../config/gameCfg/lv_exp.json")
var openCfg = require("../../../../config/gameCfg/open.json")
var openMap = {}
for(var i in openCfg){
	if(!openMap[openCfg[i].lv])
		openMap[openCfg[i].lv] = []
	openMap[openCfg[i].lv].push(openCfg[i].key)
}
console.log(openMap)
//经验相关
module.exports = function() {
	//增加经验
	this.addEXP = function(uid,characterId,value,cb) {
		var self = this
		var otps = {
			areaId : this.areaId,
			uid : uid,
			characterId : characterId,
			value : value,
			name : "exp"
		}
		this.incrbyCharacterInfo(otps,function(flag,curValue) {
			if(flag){
				self.checkUpgrade(otps,curValue)
			}
			if(cb)
				cb(flag,curValue)
		})
	}
	//检查升级
	this.checkUpgrade = function(otps,curValue) {
		var self = this
		self.characterDao.getCharacterInfo(otps,function(flag,characterInfo) {
			if(!flag){
				return
			}
			var characterId = Number(characterInfo.characterId)
			var oldLv = Number(characterInfo.level)
			var lv = oldLv
			var oldExp = Number(characterInfo.exp)
			var exp = oldExp
			while(lvexpCfg[lv] && lvexpCfg[lv][characterId] && exp >= lvexpCfg[lv][characterId]){
				exp -= lvexpCfg[lv][characterId]
				lv += 1
			}
			if(lv != oldLv){
				otps.name = "exp"
				otps.value = exp - oldExp
				self.incrbyCharacterInfo(otps)
				var otps2 = Object.assign({},otps)
				otps2.name = "level"
				otps2.value = lv - oldLv
				self.incrbyCharacterInfo(otps2)
				var notify = {
					"type" : "characterUpgrade",
					"characterId" : otps.characterId,
					"oldLv" : oldLv,
					"curLv" : lv,
					"exp" : exp
				}
				self.channelService.pushMessageByUids('onMessage', notify, [{
			      uid: otps.uid,
			      sid: self.connectorMap[otps.uid]
			    }])
			    if(otps.characterId === 10001)
			    	self.protagonistUpgrade(otps.uid,oldLv,lv)
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
		console.log("sysOpen ",uid,key)
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