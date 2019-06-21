//伙伴系统
var partner_advance = require("../../../../config/gameCfg/partner_advance.json")
module.exports = function() {
	//开启伙伴1
	this.openPartner1 = function(uid) {
		var otps = {
			characterId : 10002,
			areaId : this.areaId,
			uid : uid
		}
		this.createCharacter(otps)
	}
	//开启伙伴2
	this.openPartner2 = function(uid) {
		var otps = {
			characterId : 10003,
			areaId : this.areaId,
			uid : uid
		}
		this.createCharacter(otps)
	}
	//伙伴进阶
	this.advancedPartner = function(uid,characterId,cb) {
		if(characterId !== 10002 && characterId !== 10003){
			cb(false,"characterId error "+characterId)
			return
		}
		var characterInfo = this.getCharacterById(uid,characterId)
		if(!characterInfo){
			cb(false,"characterInfo error")
			return
		}
		var curAdvance = 0
		if(characterInfo.advance){
			curAdvance = characterInfo.advance
		}
		curAdvance++
		if(!partner_advance[curAdvance]){
			cb(false,"partner_advance max")
			return
		}
		var consumeStr = partner_advance[curAdvance]["pc"+this.charactersMap[characterId]]
		console.log("consumeStr",consumeStr)
		var strList = consumeStr.split("&")
		var items = []
		var values = []
		var self = this
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
			//扣除道具
			for(var i = 0;i < values.length;i++){
				self.addItem(uid,items[i],-values[i])
			}
			//进阶
			self.incrbyCharacterInfo(uid,characterId,"advance",1,function(flag,data) {
				cb(flag,data)
			})
		})
	}
}