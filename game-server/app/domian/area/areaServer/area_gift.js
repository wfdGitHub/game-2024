//新服限购
const area_gift = require("../../../../config/gameCfg/area_gift.json")
const main_name = "area_gift"
module.exports = function() {
	var self = this
	var areaGiftNum = 0
	//新服限购初始化
	this.addAreaGiftInit = function() {
		self.getAreaObj("areaInfo",main_name,function(data) {
			areaGiftNum = Number(data) || 0
		})
	}
	//获取新服限购数据
	this.getAreaGiftData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			var info = data || {}
			info.areaGiftNum = areaGiftNum
			cb(true,info)
		})
	}
	//增加新服限购人数
	this.addAreaGiftNum = function(value) {
		areaGiftNum += value || 0
		self.incrbyAreaObj("areaInfo",main_name,value)
	}
	//领取新服限购奖励
	this.gainAreaGiftAward = function(uid,index,type,cb) {
		if(type !== "base" && type !== "high"){
			cb(false,"type error "+type)
			return
		}
		if(!area_gift[index] || !area_gift[index][type]){
			cb(false,"index or type error "+index+"  "+type)
			return
		}
		if(areaGiftNum < area_gift[index]["num"]){
			cb(false,"条件未达成 "+areaGiftNum+"/"+area_gift[index]["num"])
			return
		}
		self.getObj(uid,main_name,type+"_"+index,function(data) {
			if(data){
				cb(false,"奖励已领取")
			}else{
				self.setObj(uid,main_name,type+"_"+index,1)
				var awardList = self.addItemStr(uid,area_gift[index][type],1,"新服限购"+type+index)
				cb(true,awardList)
			}
		})
	}
}