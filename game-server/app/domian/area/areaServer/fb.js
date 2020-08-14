var fb_base = require("../../../../config/gameCfg/fb_base.json")
var async = require("async")
for(var type in fb_base){
	for(var i = 1;i <= 3;i++){
		fb_base[type]["boss"+i] = JSON.parse(fb_base[type]["boss"+i])
	}
}
//副本系统
var uuid = require("uuid")
module.exports = function() {
	var self = this
	var userfbs = {}
	//加载副本数据
	this.fbLoad = function(uid,cb) {
		self.getObjAll(uid,"fb",function(data) {
			if(!data){
				data = {}
			}
			for(var i in data){
				data[i] = Number(data[i])
			}
			userfbs[uid] = data
		})
	}
	//移除副本数据
	this.fbUnload = function(uid) {
		delete userfbs[uid]
	}
	//开启副本
	this.openFB = function(uid,type,cb) {
		//参数判断
		if(!fb_base[type]){
			console.error("fb type error"+type)
			cb(false,"副本不存在")
			return
		}
		async.waterfall([
			function(next) {
				//判断主角等级
				let lv = self.getLordLv(uid)
				if(lv < fb_base[type]["openLevel"]){
					console.error("openLevel "+lv+" / "+fb_base[type]["openLevel"])
					next("等级不足")
				}else{
					next()
				}
			},
			function(next) {
				//判断是否已进入副本
				if(userfbs[uid] && userfbs[uid][type]){
					console.error("已进入副本 "+bossId)
					next("已进入副本")
					return
				}
				next()
			},
			function(next) {
				//进入副本
				self.joinFB(uid,type,cb)
			}
		],function(err) {
				cb(false,err)
		})
	}
	//加入副本
	this.joinFB = function(uid,type,cb) {
		self.setObj(uid,"fb",type,1)
		userfbs[uid][type] = 1
		cb(true)
	}
	//挑战副本BOSS
	this.challengeFBBoss = function(uid,type,verify,cb) {
		async.waterfall([
			function(next) {
				//获取副本数据
				if(!userfbs[uid] || !userfbs[uid][type])
					next("未进入副本")
				else
					next(null,userfbs[uid][type])
			},
			function(bossId,next) {
			    var fightInfo = self.getFightInfo(uid)
			    if(!fightInfo){
			    	next("未准备")
			    	return
			    }
			   	var atkTeam = fightInfo.team
			   	var seededNum = fightInfo.seededNum
			   	var defTeam = fb_base[type]["boss"+bossId]
			    var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
			    if(verify !== JSON.stringify(self.fightContorl.getFightRecord()[0])){
			    	next({"text":"战斗验证错误","fightRecord":self.fightContorl.getFightRecord()})
			    	return
			    }
			    if(winFlag){
		    		var info = {
		    			winFlag : winFlag,
		    			bossId : bossId
		    		}
		    		self.incrbyObj(uid,"fb",type,1)
		    		userfbs[uid][type]++
		    		if(bossId >= 3){
		    			//通关奖励
			    		info.passAward = self.addItemStr(uid,fb_base[type]["passAward"])
			    		self.taskUpdate(uid,"passFb",1,type)
		    		}
		    		var bossAwards = []
		    		bossAwards = bossAwards.concat(self.addItemStr(uid,fb_base[type]["awardList"+bossId]))
		    		info.bossAward = bossAwards
		    		cb(true,info)
			    }else{
			    	cb(false,self.fightContorl.getFightRecord())
			    }
			},
		],function(err) {
			cb(false,err)
		})
	}
	//获取副本数据
	this.getFBInfo = function(uid,cb) {
		cb(userfbs[uid])
	}
	//判断是否通关副本
	this.checkPassFB = function(uid,type) {
		if(!userfbs[uid] || !userfbs[uid][type] || userfbs[uid][type] <= 3)
			return false
		else 
			return true
	}
}