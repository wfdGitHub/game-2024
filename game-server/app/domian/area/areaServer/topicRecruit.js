//主题招募
const heros = require("../../../../config/gameCfg/heros.json")
const recruit_base = require("../../../../config/gameCfg/recruit_base.json")
const recruit_list = require("../../../../config/gameCfg/recruit_list.json")
const recruit_topic_cfg = require("../../../../config/gameCfg/recruit_topic_cfg.json")
const recruit_topic_hero = require("../../../../config/gameCfg/recruit_topic_hero.json")
const default_cfg = require("../../../../config/gameCfg/default_cfg.json")
const star_base = require("../../../../config/gameCfg/star_base.json")
const GM_CFG = require("../../../../config/gameCfg/GM_CFG.json")
const util = require("../../../../util/util.js")
const async = require("async")
const main_name = "topic_recruit"
var topicList = []
for(var i in recruit_topic_hero)
	topicList.push({id:i,heroId:recruit_topic_hero[i]["topic"]})
module.exports = function() {
	var self = this
	var curTopic = 0
	var curTopicHero = 0
	var local = {}
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
		for(var type in recruit_base){
			self.delObj(uid,"playerData",type+"_count")
		}
		self.delObj(uid,"playerData","ace_lotto_count")
		self.delObj(uid,"playerData","bf_lotto_count")
		// local.resetTopicRecruitTask(uid)
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
	//道具招募英雄
	this.recruitHeroByItem = function(uid,type,count,cb) {
		if(!Number.isInteger(count) || count < 1 || !recruit_base[type] || !recruit_base[type]["pc"]){
			cb(false,"arg error")
			return
		}
		var pcStr = recruit_base[type]["pc"]
		var heroInfos = []
		async.waterfall([
			function(next) {
			  //判断背包上限
			  self.heroDao.getHeroAmount(uid,function(flag,info) {
			      if(info.cur + count > info.max){
			        next("英雄背包已满")
			      }else{
			        next()
			      }
			  })
			},
			function(next) {
		      self.consumeItems(uid,pcStr,count,"召唤"+type,function(flag,err) {
		        if(!flag){
		          next(err)
		          return
		        }
		        local.recruitHero(uid,type,count,cb)
		      })
			}
		],function(err) {
			cb(false,err)
		})
	}
	//元宝招募英雄
	this.recruitHeroByGold = function(uid,type,count,cb) {
		if(!Number.isInteger(count) || count < 1 || !recruit_base[type] || !recruit_base[type]["gold_"+count]){
			cb(false,"arg error")
			return
		}
		var pcStr = recruit_base[type]["gold_"+count]
		var gmLv = self.getLordAtt(uid,"gmLv")
		var heroInfos = []
		async.waterfall([
			function(next) {
			  //判断背包上限
			  self.heroDao.getHeroAmount(uid,function(flag,info) {
			      if(info.cur + count > info.max){
			        next("英雄背包已满")
			      }else{
			        next()
			      }
			  })
			},
			function(next) {
				//判断招募上限
				if(recruit_base[type]["count"]){
					self.getObj(uid,"playerData",type+"_count",function(data) {
						data = Number(data) || 0
						if((data + count) > (recruit_base[type]["count"] + GM_CFG[gmLv]["recruit"])){
							next("可用次数不足")
						}else{
							next()
						}
					})
				}else{
					next()
				}
			},
			function(next) {
		      self.consumeItems(uid,pcStr,1,"召唤"+type,function(flag,err) {
		        if(!flag){
		          next(err)
		          return
		        }
		        if(recruit_base[type]["count"])
		        	self.incrbyObj(uid,"playerData",type+"_count",count)
				local.recruitHero(uid,type,count,cb)
		      })
			}
		],function(err) {
			console.log(err)
			cb(false,err)
		})
	}
	local.recruitHero = function(uid,type,count,cb) {
        var paStr = recruit_base[type].pa
        if(paStr)
          self.addItemStr(uid,paStr,count,"召唤英雄")
        switch(type){
          case "normal":
            self.taskUpdate(uid,"recruit_normal",count)
            self.taskUpdate(uid,"recruit",count)
            heroInfos = self.heroDao.randHero(self.areaId,uid,type,count)
          break
          case "great":
            self.taskUpdate(uid,"recruit_great",count)
            self.taskUpdate(uid,"recruit",count)
            heroInfos = self.heroDao.randHeroLuck(self.areaId,uid,type,count)
          break
          case "camp_1":
          case "camp_2":
          case "camp_3":
          case "camp_4":
            heroInfos = self.heroDao.randHero(self.areaId,uid,type,count)
            self.taskUpdate(uid,"general",count)
          break
          case "topic":
			self.getObj(uid,main_name,"count",function(num) {
				heroInfos = local.recruit(uid,num,count)
				cb(true,heroInfos)
			})
		  return
          break
          default:
            heroInfos = self.heroDao.randHero(self.areaId,uid,type,count)
          break
        }
        cb(true,heroInfos)
	}
	//主题招募一次
	this.topicRecruitOnce = function(uid,cb) {
		cb(false,"接口已弃用")
		// self.consumeItems(uid,default_cfg["topic_lotto_1"]["value"],1,"主题召唤",function(flag,err) {
		// 	if(!flag){
		// 		cb(false,err)
		// 	}else{
		// 	}
		// })
	}
	//主题招募十次
	this.topicRecruitMultiple = function(uid,cb) {
		cb(false,"接口已弃用")
		// self.consumeItems(uid,default_cfg["topic_lotto_10"]["value"],1,"主题召唤",function(flag,err) {
		// 	if(!flag){
		// 		cb(false,err)
		// 	}else{
		// 		self.getObj(uid,main_name,"count",function(num) {
		// 			var heroInfos = local.recruit(uid,num,10)
		// 			cb(true,heroInfos)
		// 		})
		// 	}
		// })
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
	      	var heroId = self.heroDao.randHeroId("hero_5")
			var heroInfo = self.heroDao.gainHero(self.areaId,uid,{id : heroId})
			heroInfos.push(heroInfo)
	      }else if(i == 9 && luckNum == 0){
	      	var heroId = self.heroDao.randHeroId("hero_4")
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
							heroId = self.heroDao.randHeroId("hero_4")
						}
						var heroInfo = self.heroDao.gainHero(self.areaId,uid,{id : heroId})
						heroInfos.push(heroInfo)
		        	}else{
						var heroList = recruit_list[type].heroList
						var heroId = heroList[Math.floor(heroList.length * Math.random())]
						if(star5_num >= 1 && heros[heroId].min_star >= 5){
							heroId = self.heroDao.randHeroId("hero_4")
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
	//获取主题招募英雄任务
	this.gainTopicRecruitHeroTask = function(uid,heroId,cb) {
		self.getObjAll(uid,main_name+":"+heroId,function(data) {
			cb(true,data || {})
		})
	}
	//完成主题招募英雄任务
	this.finishTopicRecruitHeroTask = function(uid,heroId,star,cb) {
		if(!heros[heroId]){
			cb(false,"heroId error "+heroId)
			return
		}
		if(!(Number.isInteger(star) && star_base[star] && star_base[star]["topic_award"])){
			cb(false,"star error "+star)
			return
		}
		async.waterfall([
			function(next) {
				self.getObj(uid,"heroArchive",heroId,function(data) {
					if(!data || data < star)
						next("star limit")
					else
						next()
				})
			},
			function(next) {
				self.getObj(uid,main_name+":"+heroId,star,function(data) {
					if(data)
						next("已领取")
					else
						next()
				})
			},
			function(next) {
				self.setObj(uid,main_name+":"+heroId,star,1)
				var awardList = self.addItemStr(uid,star_base[star]["topic_award"],1,"升星"+heroId+":"+star)
				cb(true,awardList)
			}
		],function(err) {
			cb(false,err)
		})
	}
}