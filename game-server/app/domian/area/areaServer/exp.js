var lvexpCfg = require("../../../../config/gameCfg/lv_exp.json")
//主角相关
module.exports = function() {
	//增加主角经验
	this.addProEXP = function(uid,value,cb) {
		var self = this
		var otps = {
			areaId : this.areaId,
			uid : uid,
			characterId : 10001,
			value : value,
			name : "exp"
		}
		this.incrbyCharacterInfo(otps,function(flag,curValue) {
			if(flag){
				self.checkUpgrade(otps,curValue)
			}
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
				otps.name = "level"
				otps.value = lv - oldLv
				self.incrbyCharacterInfo(otps)
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
			}
		})
	}
}