var itemCfg = require("../../../../config/gameCfg/item.json")
//物品处理
module.exports = function() {
	//增加物品
	this.addItem = function(uid,itemId,value,cb) {
		if(!itemCfg[itemId]){
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
				self.channelService.pushMessageByUids('onMessage', notify, [{
			      uid: uid,
			      sid: self.connectorMap[uid]
			    }])
			}
			if(cb)
				cb(flag,curValue)
		})
	}
	//增加物品回调
	this.addItemCB = function(uid,itemId,value,cb) {
		if(itemCfg[itemId] && itemCfg[itemId].isBag){
			this.addBagItem(uid,itemId,value,cb)
		}else{
			switch(itemId){
				case 100:
					//主角经验
					this.addEXP(uid,10001,value,cb)
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