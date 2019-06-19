var itemCfg = require("../../../../config/gameCfg/item.json")
//物品处理
module.exports = function() {
	//增加物品
	this.addItem = function(otps,cb) {
		var self = this
		self.addItemCB(otps,function(flag,curValue) {
			if(flag){
				var notify = {
					"type" : "addItem",
					"itemId" : otps.itemId,
					"value" : otps.value,
					"curValue" : curValue
				}
				self.channelService.pushMessageByUids('onMessage', notify, [{
			      uid: otps.uid,
			      sid: self.connectorMap[otps.uid]
			    }])
			}
			if(cb)
				cb(flag,curValue)
		})
	}
	//增加物品回调
	this.addItemCB = function(otps,cb) {
		switch(otps.itemId){
			case 100:
				//主角经验
				this.addEXP(otps.uid,10001,otps.value,cb)
			break
			case 101:
				//伙伴经验
				this.addEXP(otps.uid,otps.characterId,otps.value,cb)
			break
			case 3001:
				this.addBagItem(otps.uid,otps.itemId,otps.value,cb)
			break
			default:
				console.log("addItem error : "+otps.itemId)
				if(cb)
					cb(false,"itemId error : "+otps.itemId)
		}
	}
	this.addItemStr = function(otps,str) {
		var list = str.split("&")
		var self = this
		list.forEach(function(m_str) {
			var m_list = m_str.split(":")
			var itemId = Number(m_list[0])
			var value = Number(m_list[1])
			var info = Object.assign(otps,{
				itemId : itemId,
				value : value
			})
			self.addItem(info)
		})
	}
}