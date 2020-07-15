//元神抽奖
const ace_lotto_cfg = require("../../../../config/gameCfg/ace_lotto_cfg.json")
const ace_lotto_topic = require("../../../../config/gameCfg/ace_lotto_topic.json")
const ace_pack = require("../../../../config/gameCfg/ace_pack.json")
var util = require("../../../../util/util.js")
const main_name = "ace_lotto" 
var topicList = []
var aceLottoWeight = []
var ace_qualitys = {}
var allWeight = 0
for(var i in ace_lotto_topic)
	topicList.push([ace_lotto_topic[i]["topic1"],ace_lotto_topic[i]["topic2"],ace_lotto_topic[i]["topic3"]])
for(var i in ace_lotto_cfg){
	allWeight += ace_lotto_cfg[i]["weight"]
	aceLottoWeight.push({weight:allWeight,award:ace_lotto_cfg[i]["award"]})
}
for(var i in ace_pack){
	if(!ace_qualitys[ace_pack[i].quality])
		ace_qualitys[ace_pack[i].quality] = []
	ace_qualitys[ace_pack[i].quality].push(i)
}
module.exports = function() {
	var self = this
	var curTopic = 0
	var local = {}
	//每日更新
	this.aceLottoDayUpdate = function() {
		var week = util.getWeekNum()
		curTopic = week % topicList.length
	}
	//获取元神抽奖数据
	this.getaceLottoData = function(uid,cb) {
		this.getObjAll(uid,main_name,function(data) {
			if(!data)
				data = {}
			data.topics = topicList[curTopic]
			cb(true,data)
		})
	}
	//免费元神抽奖
	this.aceLottoFree = function(uid,cb) {
		self.getHMObj(uid,main_name,["free","redNum","orangeNum"],function(list) {
			var redNum = Number(list[1]) || 0
			var orangeNum = Number(list[2]) || 0
			if(list[0] != self.dayStr){
				self.setObj(uid,main_name,"free",self.dayStr)
				local.aceLottoBase(uid,redNum,orangeNum,1,cb)
			}else{
				cb(false,"今日已使用")
			}
		})
	}
	//单次元神抽奖
	this.aceLottoOnce = function(uid,cb) {
		self.consumeItems(uid,"202:220",1,function(flag,err) {
			if(!flag){
				cb(false,err)
			}else{
				self.getHMObj(uid,main_name,["redNum","orangeNum"],function(list) {
					var redNum = Number(list[0]) || 0
					var orangeNum = Number(list[1]) || 0
					local.aceLottoBase(uid,redNum,orangeNum,1,cb)
				})
			}
		})
	}
	//十连元神抽奖
	this.aceLottoMultiple = function(uid,cb) {
		self.consumeItems(uid,"202:2000",1,function(flag,err) {
			if(!flag){
				cb(false,err)
			}else{
				self.getHMObj(uid,main_name,["redNum","orangeNum"],function(list) {
					var redNum = Number(list[0]) || 0
					var orangeNum = Number(list[1]) || 0
					local.aceLottoBase(uid,redNum,orangeNum,10,cb)
				})
			}
		})
	}
	//随机抽取
	local.aceLottoBase = function(uid,redNum,orangeNum,count,cb) {
		var awardList = []
		for(var i = 0;i < count;i++){
			redNum++
			orangeNum++
			if(redNum >= 100){
				if(orangeNum >= 30)
					orangeNum -= 30
				redNum -= 100
				awardList = awardList.concat(local.aceRed(uid))
			}else if(orangeNum == 30){
				orangeNum -= 30
				awardList = awardList.concat(local.aceOrange(uid))
			}else{
				var rand = Math.random() * allWeight
				for(var j = 0;j < aceLottoWeight.length;j++){
					if(rand < aceLottoWeight[j]["weight"]){
						var award = aceLottoWeight[j]["award"]
						switch(award){
							case "topic":
								awardList = awardList.concat(local.aceTopic(uid))
							break
							case "redAce":
								awardList = awardList.concat(local.aceRed(uid))
							break
							case "orangeAce":
								awardList = awardList.concat(local.aceOrange(uid))
							break
							case "purpleAce":
								awardList = awardList.concat(local.acePurple(uid))
							break
							default:
								awardList = awardList.concat(self.addItemStr(uid,award))
						}
						break
					}
				}
			}
		}
		self.setHMObj(uid,main_name,{"redNum":redNum,"orangeNum":orangeNum})
		cb(true,{awardList:awardList,redNum:redNum,orangeNum:orangeNum})
	}
	//固定主题元神
	local.aceTopic = function(uid) {
		var award = topicList[curTopic][Math.floor(Math.random() * topicList[curTopic].length)]
		return self.addItemStr(uid,award+":1")
	}
	//固定红色元神
	local.aceRed = function(uid) {
		var award = ace_qualitys[6][Math.floor(Math.random() * ace_qualitys[6].length)]
		return self.addItemStr(uid,award+":1")
	}
	//固定橙色元神
	local.aceOrange = function(uid) {
		var award = ace_qualitys[5][Math.floor(Math.random() * ace_qualitys[5].length)]
		return self.addItemStr(uid,award+":1")
	}
	//固定紫色元神
	local.acePurple = function(uid) {
		var award = ace_qualitys[4][Math.floor(Math.random() * ace_qualitys[4].length)]
		return self.addItemStr(uid,award+":1")
	}
}