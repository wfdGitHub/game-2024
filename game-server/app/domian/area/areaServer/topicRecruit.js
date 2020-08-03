//主题招募
const heros = require("../../../../config/gameCfg/heros.json")
const recruit_base = require("../../../../config/gameCfg/recruit_base.json")
const recruit_list = require("../../../../config/gameCfg/recruit_list.json")
const recruit_topic_cfg = require("../../../../config/gameCfg/recruit_topic_cfg.json")
const recruit_topic_hero = require("../../../../config/gameCfg/recruit_topic_hero.json")
const util = require("../../../../util/util.js")
const main_name = "topic_recruit"
var topicList = []
for(var i in recruit_topic_hero)
	topicList.push(recruit_topic_hero[i]["topic"])
module.exports = function() {
	var self = this
	var curTopicHero = 0
	var local = {}
	//每日更新
	this.topicRecruitDayUpdate = function() {
		var week = util.getWeekNum()
		curTopicHero = topicList[week % topicList.length]
	}
	//获取主题招募数据
	this.getTopicRecruitData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			var week_record = util.getWeek()
			if(!data){
				self.setObj(uid,main_name,"week_record",week_record)
				cb(true,{count : 0,curTopicHero : curTopicHero})
			}else if(data.week_record != week_record){
				self.delObj(uid,main_name,"count")
				self.delObj(uid,main_name,"box_1")
				self.delObj(uid,main_name,"box_2")
				self.delObj(uid,main_name,"box_3")
				self.delObj(uid,main_name,"box_4")
				self.delObj(uid,main_name,"box_5")
				self.setObj(uid,main_name,"week_record",week_record)
				cb(true,{count : 0,curTopicHero : curTopicHero})
			}else{
				if(!data.count)
					data.count = 0
				delete data.week_record
				data.curTopicHero = curTopicHero
				cb(true,data)
			}
		})
	}
	//主题招募一次
	this.topicRecruitOnce = function(uid,cb) {
		self.consumeItems(uid,"202:220",1,function(flag,err) {
			if(!flag){
				cb(false,err)
			}else{
				self.incrbyObj(uid,main_name,"count",1)
				var heroInfos = local.recruit(uid,1)
				cb(true,heroInfos)
			}
		})
	}
	//主题招募十次
	this.topicRecruitMultiple = function(uid,cb) {
		self.consumeItems(uid,"202:2000",1,function(flag,err) {
			if(!flag){
				cb(false,err)
			}else{
				self.incrbyObj(uid,main_name,"count",10)
				var heroInfos = local.recruit(uid,10)
				cb(true,heroInfos)
			}
		})
	}
	//领取主题招募奖励
	this.gainTopicRecruitBoxAward = function(uid,index,cb) {
		if(!recruit_topic_cfg["box_"+index]){
			cb(false,"奖励不存在")
			return
		}
		self.getHMObj(uid,main_name,["count","box_"+index],function(list) {
			if(list[1]){
				cb(false,"已领取")
			}else{
				var count = Number(list[0])
				if(count >= recruit_topic_cfg["box_"+index]["key"]){
					self.setObj(uid,main_name,"box_"+index,1)
					var awardList = self.addItemStr(uid,recruit_topic_cfg["box_"+index]["value"])
					cb(true,awardList)
				}else{
					cb(false,"条件不满足")
				}
			}

		})
	}
	local.recruit = function(uid,count) {
		var allWeight = recruit_base["topic"]["allWeight"]
		var weights = recruit_base["topic"]["weights"]
	    var heroInfos = []
	    for(var num = 0;num < count;num++){
	      var rand = Math.random() * allWeight
	      for(var type in weights){
	        if(rand < weights[type]){
	        	if(type == "topic"){
					var heroInfo = self.heroDao.gainHero(self.areaId,uid,{id : curTopicHero})
					heroInfos.push(heroInfo)
	        	}else{
					var heroList = recruit_list[type].heroList
					var heroId = heroList[Math.floor(heroList.length * Math.random())]
					var heroInfo = self.heroDao.gainHero(self.areaId,uid,{id : heroId})
					heroInfos.push(heroInfo)
	        	}
	        	break
	        }
	      }
	    }
	  	return heroInfos
	}
}