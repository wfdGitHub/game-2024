var itemCfg = require("../../../../config/gameCfg/item.json")
var lvexpCfg = require("../../../../config/gameCfg/lv_exp.json")
//物品处理
module.exports = function() {
	//增加物品
	this.addItem = function(otps,cb) {
		switch(otps.itemId){
			case 100:
				//主角经验
				this.addProEXP(otps.uid,otps.value,this.addItemCB(otps,cb))
			break
			default:
				console.log("addItem error : "+otps.itemId)
				cb(false,"itemId error : "+otps.itemId)
		}
	}
	this.addItemCB = function(otps,cb) {
		var self = this
		return function(flag,curValue) {
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
			cb(flag,curValue)
		}
	}
}