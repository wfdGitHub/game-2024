//游戏战令
const main_name = "pass"
const game_pass_cfg = require("../../../../config/gameCfg/game_pass_cfg.json")
for(var i in game_pass_cfg)
	game_pass_cfg[i]["table"] = require("../../../../config/gameCfg/"+game_pass_cfg[i]["cfg"]+".json")
module.exports = function() {
	var self = this
	//获取数据
	this.methods.getPassData = function(uid,msg,cb) {
		var pId = msg.pId
		if(!game_pass_cfg[pId]){
			cb(false,"pId error")
			return
		}
		var needKey = game_pass_cfg[pId]["key"]
		self.getHMObj(uid,main_name,[pId,needKey],function(list) {
			console.log(list)
			self.getObjAll(uid,pId,function(data) {
				if(!data)
					data = {}
				data.state = list[0] || 0
				data.value = list[1] || 0
				cb(true,data)
			})
		})
	}
	//更新参数
	this.incrbyPassKey = function(uid,key) {
		self.incrbyObj(uid,main_name,key,1)
	}
	//更新参数
	this.setPassKey = function(uid,key,value) {
		self.setObj(uid,main_name,key,value)
	}
	//激活战令
	this.methods.activatePass = function(uid,msg,cb){
		var pId = msg.pId
		if(!game_pass_cfg[pId])
			return
		self.delObjAll(uid,pId)
		self.setObj(uid,main_name,pId,1)
		cb(true)
	}
	//领取奖励
	this.methods.gainPassAward = function(uid,msg,cb) {
		var pId = msg.pId
		var id = msg.id
		if(!game_pass_cfg[pId] || !game_pass_cfg[pId]["table"][id]){
			cb(false,"pId or id error")
			return
		}
		var needKey = game_pass_cfg[pId]["key"]
		self.getHMObj(uid,main_name,[pId,needKey],function(list) {
			if(!list[0]){
				cb(false,"战令未激活")
				return
			}
			var value = Number(list[1]) || 0
			if(value < game_pass_cfg[pId]["table"][id]["need"]){
				cb(false,"条件未满足")
				return
			}
			self.incrbyObj(uid,pId,id,1,function(data) {
				if(data !== 1){
					cb(false,"已领取")
					return
				}
				var awardList = self.addItemStr(uid,game_pass_cfg[pId]["table"][id]["award"])
				cb(true,awardList)
			})
		})
	}
	//领取免费挡位奖励
	this.methods.gainPassFreeAward = function(uid,msg,cb) {
		var pId = msg.pId
		var id = msg.id
		if(!game_pass_cfg[pId] || !game_pass_cfg[pId]["table"][id]){
			cb(false,"pId or id error")
			return
		}
		var needKey = game_pass_cfg[pId]["key"]
		self.getObj(uid,main_name,needKey,function(value) {
			var value = Number(value) || 0
			if(value < game_pass_cfg[pId]["table"][id]["need"]){
				cb(false,"条件未满足")
				return
			}
			self.incrbyObj(uid,pId,"f"+id,1,function(data) {
				if(data !== 1){
					cb(false,"已领取")
					return
				}
				var awardList = self.addItemStr(uid,game_pass_cfg[pId]["table"][id]["free"])
				cb(true,awardList)
			})
		})
	}
}