//新服抽奖
const ticket_cfg = require("../../../../config/gameCfg/ticket_cfg.json")
const util = require("../../../../util/util.js")
const main_name = "ticket"
const oneDayTime = 86400000
module.exports = function() {
	var self = this
	var info = {
		"state" : 1,//1  未开启  2开启中
		"endTime" : 0,//结束时间
	}
	//活动更新
	this.updateTicket = function() {
		self.getAreaObj(main_name,"info",function(data) {
			if(data){
				info = JSON.parse(data)
			}else if(self.areaDay >= 1){
				//开启活动
				info["state"] = 2
				info.endTime = util.getZeroTime() + oneDayTime * 3 - 10000
			}
			if(info.state == 2 && Date.now() > info.endTime){
				//判断关闭
				info.state = 1
				self.endTicket()
			}
			self.setAreaObj(main_name,"info",JSON.stringify(info))
		})
	}
	//获取抽奖数据
	this.methods.getTicketData = function(uid,msg,cb) {
		var data = {}
		data.info = info
		self.getAreaObj(main_name+"_join",uid,function(join) {
			info.join = join
			self.getAreaLen(main_name+"_join",function(len) {
				data.allUser = len
				cb(true,data)
			})
		})
	}
	//参与抽奖
	this.methods.joinTicket = function(uid,msg,cb) {
		if(info.state != 2){
			cb(false,"活动未开启")
			return
		}
		self.getAreaObj(main_name+"_join",uid,function(data) {
			if(data){
				cb(false,"已参与抽奖")
				return
			}
			self.consumeItems(uid,ticket_cfg["join"]["value"],1,"新服抽奖",function(flag,err) {
				if(!flag){
					cb(false,err)
					return
				}
				self.setAreaObj(main_name+"_join",uid,1)
				cb(true)
			})
		})
	}
	//结算奖励
	this.endTicket = function() {
		self.getAreaObjAll(main_name+"_join",function(data) {
			if(!data)
				return
			var list = Object.keys(data)
			var wins = []
			for(var i = 0;i < ticket_cfg["count"]["value"];i++){
				if(list.length > 0){
					var index = Math.floor(list.length * Math.random())
					wins.push(list[index])
					self.setAreaObj(main_name+"_join",list[index],2)
					list.splice(index, 1)
				}
			}
			for(var i = 0;i < wins.length;i++)
				self.sendTextToMail(wins[i],"ticket_win",ticket_cfg["win_back"]["value"])
			for(var i = 0;i < list.length;i++)
				self.sendTextToMail(list[i],"ticket_lose",ticket_cfg["loss_back"]["value"])
		})
	}
}