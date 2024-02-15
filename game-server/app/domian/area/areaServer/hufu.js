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
const weight = {"1":0.35,"2":0.25,"3":0.1,"4":0.01}
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
		}
		return self.gainHufu(uid,info)
	}
	//生成指定护符  lv s1 s2
	this.gainHufu = function(uid,info){
		if(!info.id)
			info.id = self.getLordLastid(uid)
		self.setObj(uid,main_name,info.id,JSON.stringify(info))
		return info
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
			awardList = self.addItemStr(uid,"202:"+count,1,"出售护符"+hufuInfos[i])
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
		if(!ids || ids.length !== 2){
			cb(false,"ids error")
			return
		}
		if(!hufu_quality[lv] || !Number.isInteger(lv) || lv >= 4){
			cb(false,"lv error "+lv)
			return
		}
		var idMap = {}
		for(var i = 0;i < ids.length;i++){
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
			if(Math.random() < weight[lv])
				lv++
			var info = self.gainRandHufu(uid,lv)
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
}