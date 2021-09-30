//护符
const main_name= "hufu"
const hufu_quality = require("../../../../config/gameCfg/hufu_quality.json")
const hufu_skill = require("../../../../config/gameCfg/hufu_skill.json")
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
	this.sellHufu = function(uid,id,cb) {
		self.getObj(uid,main_name,id,function(hufuInfo) {
			if(!hufuInfo){
				cb(false,"护符不存在")
				return
			}
			self.delObj(uid,main_name,id)
			var info = JSON.parse(hufuInfo)
			var count = hufu_quality[info.lv]["sell"]
			var awardList = self.addItemStr(uid,"1000040:"+count,1,"出售护符"+hufuInfo)
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
	//洗练石洗练
	this.washHufu = function(uid,id,cb) {
		self.getObj(uid,main_name,id,function(hufuInfo) {
			if(!hufuInfo){
				cb(false,"护符不存在")
				return
			}
			self.delObj(uid,main_name,id)
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
}