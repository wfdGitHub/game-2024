//主题招募
const heros = require("../../../../config/gameCfg/heros.json")
const recruit_base = require("../../../../config/gameCfg/recruit_base.json")
const recruit_list = require("../../../../config/gameCfg/recruit_list.json")
const recruit_topic_cfg = require("../../../../config/gameCfg/recruit_topic_cfg.json")
const recruit_topic_hero = require("../../../../config/gameCfg/recruit_topic_hero.json")
const default_cfg = require("../../../../config/gameCfg/default_cfg.json")
const util = require("../../../../util/util.js")
const main_name = "topic_recruit"
const shilian_high = JSON.parse(default_cfg["shilian_high"]["value"])
const shilian_middle = JSON.parse(default_cfg["shilian_middle"]["value"])
var topicList = []
for(var i in recruit_topic_hero)
	topicList.push({id:i,heroId:recruit_topic_hero[i]["topic"]})
module.exports = function() {
	var self = this
	var curTopic = 0
	var curTopicHero = 0
	var local = {}
	var highHeroMap = {}
	var middleHeroMap = {}
	for(var i = 0;i < recruit_list["hero_5_3"]["heroList"].length;i++)
		highHeroMap[recruit_list["hero_5_3"]["heroList"][i]] = 1
	for(var i = 0;i < recruit_list["hero_5_2"]["heroList"].length;i++)
		middleHeroMap[recruit_list["hero_5_2"]["heroList"][i]] = 1
	//每日更新
	this.topicRecruitDayUpdate = function() {
		var day = (new Date()).getDate() - 1
		var curIndex = day % topicList.length
		curTopic = topicList[curIndex].id
		curTopicHero = topicList[curIndex].heroId
	}
	this.TopicRecruitRefresh = function(uid) {
		self.delObj(uid,main_name,"count")
		self.delObj(uid,main_name,"box_1")
		self.delObj(uid,main_name,"box_2")
		self.delObj(uid,main_name,"box_3")
		self.delObj(uid,main_name,"box_4")
		self.delObj(uid,main_name,"box_5")
		local.resetTopicRecruitTask(uid)
	}
	//获取主题招募数据
	this.getTopicRecruitData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			if(!data)
				data = {}
			delete data.week_record
			data.count = Number(data.count) || 0
			data.curTopic = curTopic
			cb(true,data)
		})
	}
	//主题招募一次
	this.topicRecruitOnce = function(uid,cb) {
		self.consumeItems(uid,default_cfg["topic_lotto_1"]["value"],1,"主题召唤",function(flag,err) {
			if(!flag){
				cb(false,err)
			}else{
				self.getObj(uid,main_name,"count",function(num) {
					var heroInfos = local.recruit(uid,num,1)
					cb(true,heroInfos)
				})
			}
		})
	}
	//主题招募十次
	this.topicRecruitMultiple = function(uid,cb) {
		self.consumeItems(uid,default_cfg["topic_lotto_10"]["value"],1,"主题召唤",function(flag,err) {
			if(!flag){
				cb(false,err)
			}else{
				self.getObj(uid,main_name,"count",function(num) {
					var heroInfos = local.recruit(uid,num,10)
					cb(true,heroInfos)
				})
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
					var awardStr = recruit_topic_cfg["box_"+index]["value"]
					if(awardStr == "topic")
						awardStr = curTopicHero+":30"
					var awardList = self.addItemStr(uid,awardStr,1,"主题招募")
					cb(true,awardList)
				}else{
					cb(false,"条件不满足")
				}
			}
		})
	}
	//重置主题任务
	local.resetTopicRecruitTask = function(uid) {
		self.clearTopicRecruitTask(uid)
		for(var i = 1;i <= 4;i++){
			self.gainTask(uid,recruit_topic_hero[curTopic]["task_"+i])
		}
	}
	//主题招募
	local.recruit = function(uid,num,count) {
		var r_luck = self.players[uid]["r_luck"]
		var allWeight = recruit_base["topic"]["allWeight"]
		var weights = Object.assign({},recruit_base["topic"]["weights"])
	  	if(self.checkLimitedTime("zhaohuan")){
	  		weights["topic"] += 100
	  		weights["hero_10"] += 100
	  		allWeight += 100
	  	}
	    var heroInfos = []
	    num = Number(num) || 0
	    var luckNum = 0
	    var star5_num = 0
	    for(var i = 0;i < count;i++){
	      num++
	      if(num == 100){
			var heroInfo = self.heroDao.gainHero(self.areaId,uid,{id : curTopicHero})
			heroInfos.push(heroInfo)
	      }else if(r_luck >= 29){
	      	var heroId = self.heroDao.randHeroId("randChip_5_2")
			var heroInfo = self.heroDao.gainHero(self.areaId,uid,{id : heroId})
			heroInfos.push(heroInfo)
	      }else if(i == 9 && luckNum == 0){
	      	var heroId = self.heroDao.randHeroId("randChip_5_1")
			var heroInfo = self.heroDao.gainHero(self.areaId,uid,{id : heroId})
			heroInfos.push(heroInfo)
			r_luck++
	      }else{
		      var rand = Math.random() * allWeight
		      for(var type in weights){
		        if(rand <= weights[type]){
		        	if(type == "topic"){
		        		var heroId = curTopicHero
						if(star5_num >= 1 && heros[heroId].min_star >= 5){
							heroId = self.heroDao.randHeroId("randChip_5_1")
						}
						var heroInfo = self.heroDao.gainHero(self.areaId,uid,{id : heroId})
						heroInfos.push(heroInfo)
		        	}else{
						var heroList = recruit_list[type].heroList
						var heroId = heroList[Math.floor(heroList.length * Math.random())]
						if(star5_num >= 1 && heros[heroId].min_star >= 5){
							heroId = self.heroDao.randHeroId("randChip_5_1")
						}
						var heroInfo = self.heroDao.gainHero(self.areaId,uid,{id : heroId})
						heroInfos.push(heroInfo)
		        	}
		        	break
		        }
		      }
		      if(!heroInfos[i]){
					var heroList = recruit_list["hero_3"].heroList
					var heroId = heroList[Math.floor(heroList.length * Math.random())]
					var heroInfo = self.heroDao.gainHero(self.areaId,uid,{id : heroId})
					heroInfos.push(heroInfo)
		      		console.error("招募没有找到英雄",weights,rand)
		      }
		      r_luck++
	      }
	      if(heroInfos[i].star >= 4)
	      	luckNum++
	      if(heroInfos[i].star >= 5){
	      	r_luck = 0
	      	star5_num++
	      }
	    }
	    self.chageLordData(uid,"r_luck",r_luck)
	    self.incrbyObj(uid,main_name,"count",count)
	  	return heroInfos
	}
	//提取无限十连英雄
	this.extractInfiniteRecruit = function(uid,heroList,cb) {
		async.waterfall([
			function(next) {
				//判断参数
				if(!heroList || !Array.isArray(heroList) || heroList.length !== 10){
					next("heroList error "+heroList)
					return
				}
				var highNum = 0
				var middleNum = 0
				for(var i = 0;i < heroList.length;i++){
					if(!heros[heroList[i]] || heros[heroList[i]]["NPC"]){
						next("heroId error "+heroList[i])
						return
					}
					if(highHeroMap[heroList[i]])
						highNum++
					if(middleHeroMap[heroList[i]])
						middleNum++
				}
				if(highNum > shilian_high.length){
						next("高资质英雄数量错误"+highNum)
						return
				}
				if(middleNum > shilian_middle.length){
						next("中资质英雄数量错误"+middleNum)
						return
				}
				next()
			},
			function(next) {
			  //判断背包上限
			  self.heroDao.getHeroAmount(uid,function(flag,info) {
			      if(info.cur + 10 > info.max){
			        next("英雄背包已满")
			      }else{
			        next()
			      }
			  })
			},
			function(next) {
		      self.consumeItems(uid,"10020:1",1,"无限十连",function(flag,err) {
		        if(!flag){
		          next(err)
		          return
		        }
						var info = []
						for(var i = 0;i < heroList.length;i++)
							info.push(self.heroDao.gainHero(self.areaId,uid,{id : heroList[i]}))
						cb(true,info)
		      })
			}
		],function(err) {
			cb(false,err)
		})
	}
}