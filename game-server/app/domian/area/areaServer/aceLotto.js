//宝物抽奖
const ace_lotto_cfg = require("../../../../config/gameCfg/ace_lotto_cfg.json")
const ace_lotto_topic = require("../../../../config/gameCfg/ace_lotto_topic.json")
const ace_pack = require("../../../../config/gameCfg/ace_pack.json")
const default_cfg = require("../../../../config/gameCfg/default_cfg.json")
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
		var day = (new Date()).getDate() - 1
		curTopic = day % topicList.length
	}
	//获取宝物抽奖数据
	this.getaceLottoData = function(uid,cb) {
		this.getObjAll(uid,main_name,function(data) {
			if(!data)
				data = {}
			data.topics = topicList[curTopic]
			cb(true,data)
		})
	}
	//免费宝物抽奖
	this.aceLottoFree = function(uid,cb) {
		self.getHMObj(uid,main_name,["free","redNum"],function(list) {
			var redNum = Number(list[1]) || 0
			if(list[0] != self.dayStr){
				self.setObj(uid,main_name,"free",self.dayStr)
				local.aceLottoBase(uid,redNum,1,cb)
			}else{
				cb(false,"今日已使用")
			}
		})
	}
	//单次宝物抽奖
	this.aceLottoOnce = function(uid,cb) {
		self.getObj(uid,"playerData","ace_lotto_count",function(data) {
			data = Number(data) || 0
			if((data + 1) > default_cfg["ace_lotto_count"]["value"]){
				cb(false,"可用次数不足")
			}else{
				self.incrbyObj(uid,"playerData","ace_lotto_count",1)
				self.consumeItems(uid,default_cfg["ace_lotto_1"]["value"],1,"宝物抽奖",function(flag,err) {
					if(!flag){
						cb(false,err)
					}else{
						self.getHMObj(uid,main_name,["redNum"],function(list) {
							var redNum = Number(list[0]) || 0
							local.aceLottoBase(uid,redNum,1,cb)
						})
					}
				})
			}
		})
	}
	//十连宝物抽奖
	this.aceLottoMultiple = function(uid,cb) {
		self.getObj(uid,"playerData","ace_lotto_count",function(data) {
			data = Number(data) || 0
			if((data + 10) > default_cfg["ace_lotto_count"]["value"]){
				cb(false,"可用次数不足")
			}else{
				self.incrbyObj(uid,"playerData","ace_lotto_count",10)
				self.consumeItems(uid,default_cfg["ace_lotto_10"]["value"],1,"宝物抽奖",function(flag,err) {
					if(!flag){
						cb(false,err)
					}else{
						self.getHMObj(uid,main_name,["redNum"],function(list) {
							var redNum = Number(list[0]) || 0
							local.aceLottoBase(uid,redNum,10,cb)
						})
					}
				})
			}
		})
	}
	//随机抽取
	local.aceLottoBase = function(uid,redNum,count,cb) {
		var awardList = []
		for(var i = 0;i < count;i++){
			redNum++
			if(redNum >= 200){
				redNum -= 200
				awardList = awardList.concat(local.aceTopic(uid))
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
								awardList = awardList.concat(self.addItemStr(uid,award,1,"宝物抽奖"))
						}
						break
					}
				}
			}
		}
		self.setHMObj(uid,main_name,{"redNum":redNum})
		cb(true,{awardList:awardList,redNum:redNum})
	}
	//固定主题
	local.aceTopic = function(uid) {
		var award = topicList[curTopic][Math.floor(Math.random() * topicList[curTopic].length)]
		return self.addItemStr(uid,award+":1",1,"宝物抽奖")
	}
	//固定红色元神
	local.aceRed = function(uid) {
		var award = ace_qualitys[6][Math.floor(Math.random() * ace_qualitys[6].length)]
		return self.addItemStr(uid,award+":1",1,"宝物抽奖")
	}
	//固定橙色元神
	local.aceOrange = function(uid) {
		var award = ace_qualitys[5][Math.floor(Math.random() * ace_qualitys[5].length)]
		return self.addItemStr(uid,award+":1",1,"宝物抽奖")
	}
	//固定紫色元神
	local.acePurple = function(uid) {
		var award = ace_qualitys[4][Math.floor(Math.random() * ace_qualitys[4].length)]
		return self.addItemStr(uid,award+":1",1,"宝物抽奖")
	}
}