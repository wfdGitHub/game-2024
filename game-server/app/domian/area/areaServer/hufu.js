//护符
const main_name= "hufu"
const hufu_quality = require("../../../../config/gameCfg/hufu_quality.json")
const hufu_skill = require("../../../../config/gameCfg/hufu_skill.json")
var uuid = require("uuid")
var skillList = []
for(var id in hufu_skill)
	skillList.push(id)
var weightMap = {}
for(var i in hufu_quality){
	weightMap[i] = {allValue : 0,list : {}}
	for(var j = 1;j <= 4;j++){
		if(hufu_quality[i]["weight"+j]){
			weightMap[i].allValue += hufu_quality[i]["weight"+j]
			weightMap[i].list["lv"+j] = weightMap[i].allValue
		}
	}
}
module.exports = function() {
	var self = this
	//护符列表
	this.getHufuList = function(uid,cb) {
		self.getObjAll(uid,main_name,function(list) {
			cb(true,list || {})
		})
	}
	//生成随机护符
	this.gainRandHufu = function(uid,lv) {
		if(!hufu_quality[lv])
			console.error("gainRandHufu lv error")
		var info = {}
		info.lv = lv
		var s1Index = Math.floor(Math.random() * skillList.length)
		var rand = Math.random() * weightMap[lv].allValue
		for(var i in weightMap[lv].list){
			if(rand < weightMap[lv].list[i]){
				info.s1 = hufu_skill[skillList[s1Index]][i]
				break
			}
		}
		if(hufu_quality[lv]["skill"] == 2){
			var s2Index = (s1Index + Math.floor(Math.random() * (skillList.length - 1)) + 1) % skillList.length
			var rand = Math.random() * weightMap[lv].allValue
			for(var i in weightMap[lv].list){
				if(rand < weightMap[lv].list[i]){
					info.s2 = hufu_skill[skillList[s2Index]][i]
					break
				}
			}
			if(s1Index == s2Index)
				console.error("gainRandHufu error s1Index == s2Index",s1Index,s2Index)
		}
		return self.gainHufu(uid,info)
	}
	//生成指定护符  lv s1 s2
	this.gainHufu = function(uid,info){
		var id = uuid.v1()
		self.setObj(uid,main_name,id,JSON.stringify(info))
		var notify = {
			"type" : "gainHufu",
			"id" : id,
			"info" : info
		}
		self.sendToUser(uid,notify)
		info.id = id
		return info
	}
	//合成护符
	//洗练护符
}
