//世界等级
const lord_lv = require("../../../../config/gameCfg/lord_lv.json")
const BEGIN_LEVEL = 40
const MAX_LEVEL = 200
module.exports = function() {
	var self = this
	self.worldLevel = BEGIN_LEVEL
	//初始化
	this.worldLevelInit = function() {
		self.getAreaObj("areaInfo","worldLevel",function(data) {
			if(data)
				self.worldLevel = Number(data)
		})
	}
	//每日刷新
	this.worldLevelDayUpdate = function() {
		self.zrangewithscore("lv_rank",-20,-1,function(list) {
			var score = 0
			for(var i = 0;i < list.length;i += 2){
				if(list[i+1]){
					score += Number(list[i+1]) || 0
				}
			}
			var rankLv = MAX_LEVEL
			if(score){
				score = Number(score / 20)
				for(var i in lord_lv){
					if(score <= lord_lv[i]["exp"]){
						rankLv = Number(i) - 1
						break
					}
				}
			}
			var areaLv = BEGIN_LEVEL + self.areaDay
			var worldLevel = Math.max(rankLv,areaLv)
			console.log("worldLevelDayUpdate!!",rankLv,areaLv,worldLevel)
			self.setAreaObj("areaInfo","worldLevel",worldLevel)
		})
	}
}