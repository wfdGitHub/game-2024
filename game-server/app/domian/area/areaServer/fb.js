var fb_base = require("../../../../config/gameCfg/fb_base.json")
var fb_cfg = require("../../../../config/gameCfg/fb_cfg.json")
var fb_samsara = require("../../../../config/gameCfg/fb_samsara.json")
var currencyId = fb_cfg["currencyId"]["value"]
var cstr = currencyId+":1"
//副本系统
var uuid = require("uuid")
module.exports = function() {
	var self = this
	//开启副本
	this.openFB = function(uid,type,cb) {
		//参数判断
		if(!fb_base[type]){
			console.error("fb type error"+type)
			cb(false,"副本不存在")
			return
		}
		//判断等级
		var curLv = self.players[uid].characters[self.heroId].level
		if(curLv < fb_base[type]["openLevel"]){
			console.error("openLevel "+curLv+" / "+fb_base[type]["openLevel"])
			cb(false,"等级不足")
			return
		}
		//判断是否已进入副本
		self.getObj(uid,"fb",type,function(bossId) {
			if(bossId){
				console.error("已进入副本 "+bossId)
				cb(false,"已进入副本")
				return
			}
			var dayStr = (new Date()).toLocaleDateString()
			//判断是否今日首次
			self.getObj(uid,"fb",type+":lastDay",function(data) {
				if(dayStr != data){
					//首次进入
					self.setObj(uid,"fb",type+":lastDay",dayStr)
					self.joinFB(uid,type,cb)
				}else{
					//非首次 扣除道具
					self.consumeItems(uid,cstr,1,function(flag,err) {
						if(!flag){
							cb(false,err)
							return
						}
						self.joinFB(uid,type,cb)
					})
				}
			})
		})
	}
	//加入副本
	this.joinFB = function(uid,type,cb) {
		self.setObj(uid,"fb",type,1)
		cb(true)
	}
	//退出副本
	this.quitFB = function(uid,type,cb) {
		self.getObj(uid,"fb",type,function(data) {
			if(!data){
				cb(false,"未进入副本")
			}else{
				self.delObj(uid,"fb",type)
				cb(true)
			}
		})
	}
	//挑战副本BOSS
	this.challengeFBBoss = function(uid,type,otps,cb) {
		self.getObj(uid,"fb",type,function(bossId) {
			if(!bossId){
				cb(false,"未进入副本")
				return
			}
			bossId = parseInt(bossId) || 1
		    var fightInfo = self.getFightInfo(uid)
		    var atkTeam = fightInfo.team
		    if(!atkTeam){
		    	cb(false,"atkTeam error")
		    	return
		    }
		    var curLv = atkTeam[0].level
		    var samsara = Math.floor(((curLv - 1) / 100))
		    if(!fb_samsara[samsara]){
		    	console.error("没有该转生等级的副本 "+samsara)
		    	cb(false,"没有该转生等级的副本 "+samsara)
		    	return
		    }
		    var defTeam = [{characterId : fb_base[type]["boss"+bossId],level : fb_samsara[samsara].bossLevel}]
		    if(fb_base[type]["mobList"+bossId]){
		      var monList = JSON.parse(fb_base[type]["mobList"+bossId])
		      monList.forEach(function(characterId) {
		        defTeam.push({characterId,characterId,level : fb_samsara[samsara].mobLevel})
		      })
		    }
		    self.recordFight(atkTeam,defTeam,fightInfo.seededNum,otps.readList)
		    var result = self.fightContorl.fighting(atkTeam,defTeam,fightInfo.seededNum,otps.readList)
		    if(result.verify === otps.verify){
		    	if(result.result === "win"){
		    		var rate = fb_samsara[samsara][type+"_power"]
		    		var info = {
		    			result : result
		    		}
		    		if(bossId >= 3){
		    			self.delObj(uid,"fb",type)
		    			//通关奖励
		    			var passAward
			    		var awardList1 = self.addItemStr(uid,fb_base[type]["passAward"],rate)
			    		var awardList2 = self.openChestStr(uid,fb_base[type]["randAward"])
			    		info.passAward = awardList1.concat(awardList2)
		    		}else{
		    			info.bossId = bossId + 1
		    			self.incrbyObj(uid,"fb",type,1)
		    		}
		    		var bossAwards = []
		    		for(var i = 0;i < fb_samsara[samsara]["bossAwardNum"];i++){
		    			bossAwards = bossAwards.concat(self.openChestStr(uid,fb_base[type]["awardList"+bossId]))
		    		}
		    		info.bossAward = bossAwards
		    		cb(true,info)
		    	}else{
		    		cb(true,{result : result})
		    	}
		    }else{
		    	console.error(otps.verify,result.verify)
		    	cb(false,result.verify)
		    }
		})
	}
	//获取副本数据
	this.getFBInfo = function(uid,cb) {
		var dayStr = (new Date()).toLocaleDateString()
		self.getObjAll(uid,"fb",function(data) {
			if(!data){
				data = {}
			}
			data.dayStr = dayStr
			cb(data)
		})
	}
}