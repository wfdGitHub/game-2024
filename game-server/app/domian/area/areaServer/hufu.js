//护符
const main_name= "hufu"
const hufu_quality = require("../../../../config/gameCfg/hufu_quality.json")
const hufu_skill = require("../../../../config/gameCfg/hufu_skill.json")
const horse_name= "horse"
const war_horse = require("../../../../config/gameCfg/war_horse.json")
const drum_name= "drum"
const war_drum = require("../../../../config/gameCfg/war_drum.json")
const banner_name= "banner"
const war_banner = require("../../../../config/gameCfg/war_banner.json")
var uuid = require("uuid")
var async = require("async")
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
var horse_quality = {}
for(var i in war_horse){
	if(!horse_quality[war_horse[i]["quality"]])
		horse_quality[war_horse[i]["quality"]] = []
	if(war_horse[i].talents)
		war_horse[i].talents = JSON.parse(war_horse[i].talents)
	else
		war_horse[i].talents = []
	horse_quality[war_horse[i]["quality"]].push(i)
}
var drum_quality = {}
for(var i in war_drum){
	if(!drum_quality[war_drum[i]["quality"]])
		drum_quality[war_drum[i]["quality"]] = []
	drum_quality[war_drum[i]["quality"]].push(i)
}
var banner_quality = {}
for(var i in war_banner){
	if(!banner_quality[war_banner[i]["quality"]])
		banner_quality[war_banner[i]["quality"]] = []
	banner_quality[war_banner[i]["quality"]].push(i)
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
	this.gainRandHufu = function(uid,lv,id) {
		if(!hufu_quality[lv]){
			console.error("gainRandHufu lv error")
			return
		}
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
		return self.gainHufu(uid,info,id)
	}
	//生成指定护符  lv s1 s2
	this.gainHufu = function(uid,info,id){
		if(!id)
			id = self.getLordLastid(uid)
		self.setObj(uid,main_name,id,JSON.stringify(info))
		var notify = {
			"type" : "gainHufu",
			"id" : id,
			"info" : info
		}
		self.sendToUser(uid,notify)
		return Object.assign({id : id},info)
	}
	//穿戴护符
	this.wearHufu = function(uid,hId,id,cb) {
		async.waterfall([
			function(next) {
				self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
					if(!flag){
						cb(false,"英雄不存在")
						return
					}
					if(heroInfo["hfLv"]){
						cb(false,"已穿戴护符")
						return
					}
					next(null,heroInfo)
				})
			},
			function(heroInfo,next) {
				self.getObj(uid,main_name,id,function(hufuInfo) {
					if(!hufuInfo){
						cb(false,"护符不存在")
						return
					}
					self.delObj(uid,main_name,id)
					hufuInfo = JSON.parse(hufuInfo)
					self.heroDao.setHeroInfo(self.areaId,uid,hId,"hfLv",hufuInfo.lv)
					heroInfo["hfLv"] = hufuInfo.lv
					if(hufuInfo.s1){
						self.heroDao.setHeroInfo(self.areaId,uid,hId,"hfs1",hufuInfo.s1)
						heroInfo["hfs1"] = hufuInfo.s1
					}
					if(hufuInfo.s2){
						self.heroDao.setHeroInfo(self.areaId,uid,hId,"hfs2",hufuInfo.s2)
						heroInfo["hfs2"] = hufuInfo.s2
					}
					cb(true,heroInfo)
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//出售护符
	this.sellHufu = function(uid,ids,cb) {
		if(!Array.isArray(ids)){
			cb(false,"ids error "+ids)
			return
		}
		self.getHMObj(uid,main_name,ids,function(hufuInfos) {
			var awardList = []
			var count = 0
			for(var i = 0;i < ids.length;i++){
				if(!hufuInfos[i]){
					cb(false,"护符不存在")
					return
				}
				self.delObj(uid,main_name,ids[i])
				var info = JSON.parse(hufuInfos[i])
				count += hufu_quality[info.lv]["sell"]
			}
			awardList = self.addItemStr(uid,"1000040:"+count,1,"出售护符"+hufuInfos[i])
			cb(true,awardList)
		})
	}
	//卸下护符
	this.unwearHufu = function(uid,hId,cb) {
		self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
			if(!flag){
				cb(false,"英雄不存在")
				return
			}
			if(!heroInfo["hfLv"]){
				cb(false,"未穿戴护符")
				return
			}
			var hufuInfo = {lv:heroInfo["hfLv"]}
			delete heroInfo["hfLv"]
			self.heroDao.delHeroInfo(self.areaId,uid,hId,"hfLv")
			if(heroInfo["hfs1"]){
				hufuInfo.s1 = heroInfo["hfs1"]
				delete heroInfo["hfs1"]
				self.heroDao.delHeroInfo(self.areaId,uid,hId,"hfs1")
			}
			if(heroInfo["hfs2"]){
				hufuInfo.s2 = heroInfo["hfs2"]
				delete heroInfo["hfs2"]
				self.heroDao.delHeroInfo(self.areaId,uid,hId,"hfs2")
			}
			self.gainHufu(uid,hufuInfo)
			cb(true,heroInfo)
		})
	}
	//合成护符
	this.compoundHufu = function(uid,ids,lv,cb) {
		if(!ids || ids.length !== 5){
			cb(false,"ids error")
			return
		}
		if(!hufu_quality[lv] || !Number.isInteger(lv) || lv >= 4){
			cb(false,"lv error "+lv)
			return
		}
		var idMap = {}
		for(var i = 0;i < ids.length;i++){
			if(typeof(ids[i]) != "string" || !ids[i]){
			  	cb(false,"Id必须是string")
			  	return
			}
			if(idMap[ids[i]]){
				cb(false,"Id不能重复")
			  	return
			}
			idMap[ids[i]] = true
		}
		self.getHMObj(uid,main_name,ids,function(list) {
			for(var i = 0;i < list.length;i++){
				if(!list[i]){
					cb(false,"id error "+ids[i])
					return
				}
				var info = JSON.parse(list[i])
				if(info.lv != lv){
					cb(false,ids[i]+" lv error "+info.lv)
					return
				}
			}
			for(var i = 0;i < ids.length;i++)
				self.delObj(uid,main_name,ids[i])
			var info = self.gainRandHufu(uid,lv+1)
			cb(true,info)
		})
	}
	//洗练护符
	this.resetHufu = function(uid,ids,lv,cb) {
		if(!ids || ids.length !== 2){
			cb(false,"ids error")
			return
		}
		if(!hufu_quality[lv] || !Number.isInteger(lv)){
			cb(false,"lv error "+lv)
			return
		}
		var idMap = {}
		for(var i = 0;i < ids.length;i++){
			if(typeof(ids[i]) != "string" || !ids[i]){
			  	cb(false,"Id必须是string")
			  	return
			}
			if(idMap[ids[i]]){
				cb(false,"Id不能重复")
			  	return
			}
			idMap[ids[i]] = true
		}
		self.getHMObj(uid,main_name,ids,function(list) {
			for(var i = 0;i < list.length;i++){
				if(!list[i]){
					cb(false,"id error "+ids[i])
					return
				}
				var info = JSON.parse(list[i])
				if(info.lv != lv){
					cb(false,ids[i]+" lv error "+info.lv)
					return
				}
			}
			self.taskUpdate(uid,"reset_hufu",1)
			for(var i = 0;i < ids.length;i++)
				self.delObj(uid,main_name,ids[i])
			var info = self.gainRandHufu(uid,lv)
			cb(true,info)
		})
	}
	//洗练护符
	this.washHufu = function(uid,id,cb) {
		self.getObj(uid,main_name,id,function(hufuInfo) {
			if(!hufuInfo){
				cb(false,"护符不存在")
				return
			}
			var info = JSON.parse(hufuInfo)
			var count = hufu_quality[info.lv]["wash"]
			self.consumeItems(uid,"1000040:"+count,1,"洗练护符"+hufuInfo,function(flag,err) {
				if(!flag){
					cb(flag,err)
					return
				}
				self.taskUpdate(uid,"reset_hufu",1)
				self.delObj(uid,main_name,id)
				var data = self.gainRandHufu(uid,info.lv,id)
				cb(true,data)
			})
		})
	}
	//战马列表
	this.getHorseList = function(uid,cb) {
		self.getObjAll(uid,horse_name,function(list) {
			cb(true,list || {})
		})
	}
	//生成随机战马
	this.gainRandHorse = function(uid,lv,id,horseId) {
		if(!horse_quality[lv]){
			console.error("gainRandHorse lv error " +lv)
			return
		}
		var info = {}
		info.lv = lv
		if(horseId)
			info.id = horseId
		else
			info.id = horse_quality[lv][Math.floor(Math.random() * horse_quality[lv].length)]
		info.val = Math.floor(Math.random() * (war_horse[info.id]["max"] - war_horse[info.id]["min"] + 1)) + war_horse[info.id]["min"]
		//概率获得技能
		if(info.lv >= 3 && Math.random() < 0.3)
			info.s1 = war_horse[info.id]["talents"][Math.floor(Math.random() * war_horse[info.id]["talents"].length)]
		return self.gainHorse(uid,info,id)
	}
	//生成指定战马
	this.gainHorse = function(uid,info,id){
		if(!id)
			id = self.getLordLastid(uid)
		self.setObj(uid,horse_name,id,JSON.stringify(info))
		var notify = {
			"type" : "gainHorse",
			"id" : id,
			"info" : info
		}
		self.sendToUser(uid,notify)
		return Object.assign({id : id},info)
	}
	//穿戴战马
	this.wearHorse = function(uid,hId,id,cb) {
		async.waterfall([
			function(next) {
				self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
					if(!flag){
						cb(false,"英雄不存在")
						return
					}
					if(heroInfo["horse"]){
						cb(false,"已穿戴战马")
						return
					}
					next(null,heroInfo)
				})
			},
			function(heroInfo,next) {
				self.getObj(uid,horse_name,id,function(horseInfo) {
					if(!horseInfo){
						cb(false,"战马不存在")
						return
					}
					self.delObj(uid,horse_name,id)
					heroInfo["horse"] = horseInfo
					self.heroDao.setHeroInfo(self.areaId,uid,hId,"horse",horseInfo)
					cb(true,heroInfo)
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//出售战马
	this.sellHorse = function(uid,ids,cb) {
		if(!Array.isArray(ids)){
			cb(false,"ids error "+ids)
			return
		}
		self.getHMObj(uid,horse_name,ids,function(hufuInfos) {
			var awardList = []
			var count = 0
			for(var i = 0;i < ids.length;i++){
				if(!hufuInfos[i]){
					cb(false,"护符不存在")
					return
				}
				self.delObj(uid,horse_name,ids[i])
				var info = JSON.parse(hufuInfos[i])
				count += war_horse[info.id]["sell"]
			}
			awardList = self.addItemStr(uid,"1000040:"+count,1,"出售战马"+hufuInfos[i])
			cb(true,awardList)
		})
	}
	//卸下战马
	this.unwearHorse = function(uid,hId,cb) {
		self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
			if(!flag){
				cb(false,"英雄不存在")
				return
			}
			if(!heroInfo["horse"]){
				cb(false,"未装备战马")
				return
			}
			var horseInfo = JSON.parse(heroInfo["horse"])
			delete heroInfo["horse"]
			self.heroDao.delHeroInfo(self.areaId,uid,hId,"horse")
			self.gainHorse(uid,horseInfo)
			cb(true,heroInfo)
		})
	}
	//合成战马
	this.compoundHorse = function(uid,ids,lv,cb) {
		if(!ids || ids.length !== 5){
			cb(false,"ids error")
			return
		}
		if(!horse_quality[lv] || !Number.isInteger(lv) || lv >= 4){
			cb(false,"lv error "+lv)
			return
		}
		var idMap = {}
		for(var i = 0;i < ids.length;i++){
			if(typeof(ids[i]) != "string" || !ids[i]){
			  	cb(false,"Id必须是string")
			  	return
			}
			if(idMap[ids[i]]){
				cb(false,"Id不能重复")
			  	return
			}
			idMap[ids[i]] = true
		}
		self.getHMObj(uid,horse_name,ids,function(list) {
			for(var i = 0;i < list.length;i++){
				if(!list[i]){
					cb(false,"id error "+ids[i])
					return
				}
				var info = JSON.parse(list[i])
				if(info.lv != lv){
					cb(false,ids[i]+" lv error "+info.lv)
					return
				}
			}
			for(var i = 0;i < ids.length;i++)
				self.delObj(uid,horse_name,ids[i])
			var info = self.gainRandHorse(uid,lv+1)
			cb(true,info)
		})
	}
	//洗练战马
	this.washHorse = function(uid,id,cb) {
		self.getObj(uid,horse_name,id,function(horseInfo) {
			if(!horseInfo){
				cb(false,"战马不存在")
				return
			}
			var info = JSON.parse(horseInfo)
			var count = war_horse[info.id]["wash"]
			self.consumeItems(uid,"1000040:"+count,1,"洗练战马"+horseInfo,function(flag,err) {
				if(!flag){
					cb(flag,err)
					return
				}
				self.delObj(uid,horse_name,id)
				var data = self.gainRandHorse(uid,info.lv,id,info.id)
				cb(true,data)
			})
		})
	}
	//战鼓列表
	this.getDrumList = function(uid,cb) {
		self.getObjAll(uid,drum_name,function(list) {
			console.log(list)
			if(!list)
				list = {}
			for(var i in list){
				if(!list[i]){
					delete list[i]
				}
			}
			console.log(list)
			cb(true,list)
		})
	}
	//生成随机战鼓
	this.gainRandDrum = function(uid,lv,id) {
		if(!drum_quality[lv]){
			console.error("gainRanddrum lv error " +lv)
			return
		}
		var info = {}
		info.lv = lv
		info.id = drum_quality[lv][Math.floor(Math.random() * drum_quality[lv].length)]
		info.val = Number((Math.random() * (war_drum[info.id]["max"] - war_drum[info.id]["min"]) + war_drum[info.id]["min"]).toFixed(3))
		return self.gainDrum(uid,info,id)
	}
	//生成指定战鼓
	this.gainDrum = function(uid,info,id){
		if(!id)
			id = self.getLordLastid(uid)
		self.setObj(uid,drum_name,id,JSON.stringify(info))
		var notify = {
			"type" : "gaindrum",
			"id" : id,
			"info" : info
		}
		self.sendToUser(uid,notify)
		return Object.assign({id : id},info)
	}
	//穿戴战鼓
	this.wearDrum = function(uid,hId,id,cb) {
		async.waterfall([
			function(next) {
				self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
					if(!flag){
						cb(false,"英雄不存在")
						return
					}
					if(heroInfo["drum"]){
						cb(false,"已穿戴战鼓")
						return
					}
					next(null,heroInfo)
				})
			},
			function(heroInfo,next) {
				self.getObj(uid,drum_name,id,function(drumInfo) {
					if(!drumInfo){
						cb(false,"战鼓不存在")
						return
					}
					self.delObj(uid,drum_name,id)
					heroInfo["drum"] = drumInfo
					self.heroDao.setHeroInfo(self.areaId,uid,hId,"drum",drumInfo)
					cb(true,heroInfo)
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//出售战鼓
	this.sellDrum = function(uid,ids,cb) {
		if(!Array.isArray(ids)){
			cb(false,"ids error "+ids)
			return
		}
		self.getHMObj(uid,drum_name,ids,function(hufuInfos) {
			var awardList = []
			var count = 0
			for(var i = 0;i < ids.length;i++){
				if(!hufuInfos[i]){
					cb(false,"护符不存在")
					return
				}
				self.delObj(uid,drum_name,ids[i])
				var info = JSON.parse(hufuInfos[i])
				count += war_drum[info.id]["sell"]
			}
			awardList = self.addItemStr(uid,"1000040:"+count,1,"出售战鼓"+hufuInfos[i])
			cb(true,awardList)
		})
	}
	//卸下战鼓
	this.unwearDrum = function(uid,hId,cb) {
		self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
			if(!flag){
				cb(false,"英雄不存在")
				return
			}
			if(!heroInfo["drum"]){
				cb(false,"未装备战鼓")
				return
			}
			var drumInfo = JSON.parse(heroInfo["drum"])
			delete heroInfo["drum"]
			self.heroDao.delHeroInfo(self.areaId,uid,hId,"drum")
			self.gainDrum(uid,drumInfo)
			cb(true,heroInfo)
		})
	}
	//合成战鼓
	this.compoundDrum = function(uid,ids,lv,cb) {
		if(!ids || ids.length !== 5){
			cb(false,"ids error")
			return
		}
		if(!drum_quality[lv] || !Number.isInteger(lv) || lv >= 4){
			cb(false,"lv error "+lv)
			return
		}
		var idMap = {}
		for(var i = 0;i < ids.length;i++){
			if(typeof(ids[i]) != "string" || !ids[i]){
			  	cb(false,"Id必须是string")
			  	return
			}
			if(idMap[ids[i]]){
				cb(false,"Id不能重复")
			  	return
			}
			idMap[ids[i]] = true
		}
		self.getHMObj(uid,drum_name,ids,function(list) {
			for(var i = 0;i < list.length;i++){
				if(!list[i]){
					cb(false,"id error "+ids[i])
					return
				}
				var info = JSON.parse(list[i])
				if(info.lv != lv){
					cb(false,ids[i]+" lv error "+info.lv)
					return
				}
			}
			for(var i = 0;i < ids.length;i++)
				self.delObj(uid,drum_name,ids[i])
			var info = self.gainRandDrum(uid,lv+1)
			cb(true,info)
		})
	}
	//洗练战鼓
	this.washDrum = function(uid,id,cb) {
		self.getObj(uid,drum_name,id,function(drumInfo) {
			if(!drumInfo){
				cb(false,"战鼓不存在")
				return
			}
			var info = JSON.parse(drumInfo)
			var count = war_drum[info.id]["wash"]
			self.consumeItems(uid,"1000040:"+count,1,"洗练战鼓"+drumInfo,function(flag,err) {
				if(!flag){
					cb(flag,err)
					return
				}
				self.delObj(uid,drum_name,id)
				var data = self.gainRandDrum(uid,info.lv,id)
				cb(true,data)
			})
		})
	}
	//军旗列表
	this.getBannerList = function(uid,cb) {
		self.getObjAll(uid,banner_name,function(list) {
			cb(true,list || {})
		})
	}
	//生成随机军旗
	this.gainRandBanner = function(uid,lv,id) {
		if(!banner_quality[lv]){
			console.error("gainRandbanner lv error " +lv)
			return
		}
		var info = {}
		info.lv = lv
		info.id = banner_quality[lv][Math.floor(Math.random() * banner_quality[lv].length)]
		info.val = Number((Math.random() * (war_banner[info.id]["max"] - war_banner[info.id]["min"]) + war_banner[info.id]["min"]).toFixed(3))
		return self.gainBanner(uid,info,id)
	}
	//生成指定军旗
	this.gainBanner = function(uid,info,id){
		if(!id)
			id = self.getLordLastid(uid)
		self.setObj(uid,banner_name,id,JSON.stringify(info))
		var notify = {
			"type" : "gainbanner",
			"id" : id,
			"info" : info
		}
		self.sendToUser(uid,notify)
		return Object.assign({id : id},info)
	}
	//穿戴军旗
	this.wearBanner = function(uid,hId,id,cb) {
		async.waterfall([
			function(next) {
				self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
					if(!flag){
						cb(false,"英雄不存在")
						return
					}
					if(heroInfo["banner"]){
						cb(false,"已穿戴军旗")
						return
					}
					next(null,heroInfo)
				})
			},
			function(heroInfo,next) {
				self.getObj(uid,banner_name,id,function(bannerInfo) {
					if(!bannerInfo){
						cb(false,"军旗不存在")
						return
					}
					self.delObj(uid,banner_name,id)
					heroInfo["banner"] = bannerInfo
					self.heroDao.setHeroInfo(self.areaId,uid,hId,"banner",bannerInfo)
					cb(true,heroInfo)
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//出售军旗
	this.sellBanner = function(uid,ids,cb) {
		if(!Array.isArray(ids)){
			cb(false,"ids error "+ids)
			return
		}
		self.getHMObj(uid,banner_name,ids,function(hufuInfos) {
			var awardList = []
			var count = 0
			for(var i = 0;i < ids.length;i++){
				if(!hufuInfos[i]){
					cb(false,"护符不存在")
					return
				}
				self.delObj(uid,banner_name,ids[i])
				var info = JSON.parse(hufuInfos[i])
				count += war_banner[info.id]["sell"]
			}
			awardList = self.addItemStr(uid,"1000040:"+count,1,"出售军旗"+hufuInfos[i])
			cb(true,awardList)
		})
	}
	//卸下军旗
	this.unwearBanner = function(uid,hId,cb) {
		self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
			if(!flag){
				cb(false,"英雄不存在")
				return
			}
			if(!heroInfo["banner"]){
				cb(false,"未装备军旗")
				return
			}
			var bannerInfo = JSON.parse(heroInfo["banner"])
			delete heroInfo["banner"]
			self.heroDao.delHeroInfo(self.areaId,uid,hId,"banner")
			self.gainBanner(uid,bannerInfo)
			cb(true,heroInfo)
		})
	}
	//合成军旗
	this.compoundBanner = function(uid,ids,lv,cb) {
		if(!ids || ids.length !== 5){
			cb(false,"ids error")
			return
		}
		if(!banner_quality[lv] || !Number.isInteger(lv) || lv >= 4){
			cb(false,"lv error "+lv)
			return
		}
		var idMap = {}
		for(var i = 0;i < ids.length;i++){
			if(typeof(ids[i]) != "string" || !ids[i]){
			  	cb(false,"Id必须是string")
			  	return
			}
			if(idMap[ids[i]]){
				cb(false,"Id不能重复")
			  	return
			}
			idMap[ids[i]] = true
		}
		self.getHMObj(uid,banner_name,ids,function(list) {
			for(var i = 0;i < list.length;i++){
				if(!list[i]){
					cb(false,"id error "+ids[i])
					return
				}
				var info = JSON.parse(list[i])
				if(info.lv != lv){
					cb(false,ids[i]+" lv error "+info.lv)
					return
				}
			}
			for(var i = 0;i < ids.length;i++)
				self.delObj(uid,banner_name,ids[i])
			var info = self.gainRandBanner(uid,lv+1)
			cb(true,info)
		})
	}
	//洗练军旗
	this.washBanner = function(uid,id,cb) {
		self.getObj(uid,banner_name,id,function(bannerInfo) {
			if(!bannerInfo){
				cb(false,"军旗不存在")
				return
			}
			var info = JSON.parse(bannerInfo)
			var count = war_banner[info.id]["wash"]
			self.consumeItems(uid,"1000040:"+count,1,"洗练军旗"+bannerInfo,function(flag,err) {
				if(!flag){
					cb(flag,err)
					return
				}
				self.delObj(uid,banner_name,id)
				var data = self.gainRandBanner(uid,info.lv,id)
				cb(true,data)
			})
		})
	}
}