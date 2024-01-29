//邮件系统
var uuid = require("uuid")
var mailText = require("../../../../config/gameCfg/mailText.json")
module.exports = function() {
	var self = this
	this.areaMailList = {}
	//获取最近一百封邮件
	this.getMailList = function(uid,cb) {
		this.redisDao.db.lrange("player:user:"+uid+":mail",-100,-1,function(err,list) {
			if(!err && list){
				cb(true,list)
			}else{
				cb(true,[])
			}
		})
	}
	//获取全部邮寄
	this.getMailAll = function(uid,cb) {
		this.redisDao.db.lrange("player:user:"+uid+":mail",0,-1,function(err,list) {
			if(!err && list){
				cb(true,list)
			}else{
				cb(true,[])
			}
		})
	}
	//通过文本模板发送邮件
	this.sendTitleTextToMail = function(uid,title,key,atts,arg,cb) {
		var text = mailText[key]["text"]
		if(arg)
			text = text.replace("xxx",arg)
		this.sendMail(uid,title,text,atts,mailText[key]["type"],cb)
	}
	//通过文本模板发送邮件
	this.sendTextToMail = function(uid,key,atts,arg,cb) {
		var title = mailText[key]["title"]
		var text = mailText[key]["text"]
		if(arg)
			text = text.replace("xxx",arg)
		this.sendMail(uid,title,text,atts,mailText[key]["type"],cb)
	}
	//发送邮件
	this.sendMail = function(uid,title,text,atts,type,cb) {
		var mailInfo = {
			title : title,
			text : text,
			id : self.getLordLastid(uid),
			time : Date.now()
		}
		mailInfo.type = type || 0
		if(atts)
			mailInfo.atts = atts
		mailInfo = JSON.stringify(mailInfo)
		this.redisDao.db.rpush("player:user:"+uid+":mail",mailInfo,function(err,data) {
			if(!err){
				var notify = {
					"type" : "newMail",
					"mailInfo" : mailInfo
				}
				self.sendToUser(uid,notify)
				if(cb)
					cb(true,data)
			}else{
				if(cb)
					cb(false,err)
			}
		})
	}
	//领取邮件附件
	this.gainMailAttachment = function(uid,index,id,cb) {
		self.redisDao.db.lindex("player:user:"+uid+":mail",index,function(err,data) {
			if(err || !data){
				if(cb)
					cb(false,err)
				return
			}
			var mailInfo = JSON.parse(data)
			if(mailInfo.id !== id){
				if(cb)
					cb(false,"id error "+mailInfo.id)
				return
			}
			if(!mailInfo.atts || mailInfo.receive){
				if(cb)
					cb(false,"该邮件没有附件或已领取")
				return
			}
			mailInfo.receive = true
			mailInfo.read = true
			self.redisDao.db.lset("player:user:"+uid+":mail",index,JSON.stringify(mailInfo),function(err,data) {
				if(!err){
					var awardList = self.addItemStr(uid,mailInfo.atts,1,"邮件:"+mailInfo.title)
					if(cb)
						cb(true,awardList)
				}else{
					if(cb)
						cb(false,err)
				}
			})
		})
	}
	//阅读邮件
	this.readMail = function(uid,index,id,cb) {
		self.redisDao.db.lindex("player:user:"+uid+":mail",index,function(err,data) {
			if(err || !data){
				cb(false,err)
				return
			}
			var mailInfo = JSON.parse(data)
			if(mailInfo.id !== id){
				cb(false,"id error "+mailInfo.id)
				return
			}
			mailInfo.read = true
			self.redisDao.db.lset("player:user:"+uid+":mail",index,JSON.stringify(mailInfo),function(err,data) {
				if(!err){
					cb(true)
				}else{
					cb(false,err)
				}
			})
		})
	}
	//删除邮件
	this.deleteMail = function(uid,index,id,cb) {
		self.redisDao.db.lindex("player:user:"+uid+":mail",index,function(err,data) {
			if(err || !data){
				if(cb)
					cb(false,err)
				return
			}
			var mailInfo = JSON.parse(data)
			if(mailInfo.id !== id){
				if(cb)
					cb(false,"id error "+mailInfo.id)
				return
			}
			self.redisDao.db.lrem("player:user:"+uid+":mail",0,data,function(err,data) {
				if(err){
					if(cb)
						cb(false,err)
				}else{
					if(cb)
						cb(true)
				}
			})
		})
	}
	//一键领取
	this.gainAllMailAttachment = function(uid,cb) {
		self.getMailAll(uid,function(flag,list) {
			var awardList = []
			for(var i = 0;i < list.length;i++){
				var mailInfo = JSON.parse(list[i])
				if(mailInfo.atts && !mailInfo.receive){
					mailInfo.receive = true
					mailInfo.read = true
					self.redisDao.db.lset("player:user:"+uid+":mail",i,JSON.stringify(mailInfo))
					awardList = awardList.concat(self.addItemStr(uid,mailInfo.atts,1,"邮件:"+mailInfo.title))
				}
			}
			cb(true,awardList)
		})
	}
	//一键删除已读
	this.deleteAllReadMail = function(uid,cb) {
		self.getMailAll(uid,function(flag,list) {
			var indexList = []
			for(var i = 0;i < list.length;i++){
				var mailInfo = JSON.parse(list[i])
				if(mailInfo.read && (!mailInfo.atts || mailInfo.receive)){
					indexList.push(i)
					self.deleteMail(uid,i,mailInfo.id)
				}
			}
			cb(true,indexList)
		})
	}
	//初始化全服邮件
	this.initAreaMail = function() {
		var self = this
		self.redisDao.db.hgetall("allAreaMail",function(err,data) {
			self.areaMailList = {}
			for(var id in data){
				data[id] = JSON.parse(data[id])
				if(data[id].areaMap["all"] || data[id].areaMap[self.areaId])
					self.areaMailList[id] = data[id]
			}
		})
	}
	//更新全服邮件
	this.updateAreaMail = function() {
		var self = this
		self.redisDao.db.hgetall("allAreaMail",function(err,data) {
			var oldMailList = self.areaMailList
			self.areaMailList = {}
			for(var id in data){
				data[id] = JSON.parse(data[id])
				if(data[id].areaMap["all"] || data[id].areaMap[self.areaId]){
					self.areaMailList[id] = data[id]
					if(!oldMailList[id]){
						for(var uid in self.players){
							self.checkAreaMailOne(uid,id)
						}
					}
				}
			}
		})
	}
	//获取全服邮件
	this.getAreaMailList = function(cb) {
		cb(true,this.areaMailList)
	}
	//检测所有全服邮件
	this.checkAreaMailAll = function(uid) {
		var ids = []
		var self = this
		var curTime = Date.now()
		for(var id in self.areaMailList){
			if(curTime > self.areaMailList[id].beginTime && curTime < self.areaMailList[id].endTime)
				ids.push(id)
		}
		self.getHMObj(uid,"areaMail",ids,function(list) {
			for(var i = 0;i < ids.length;i++){
				if(!list || !list[i]){
					self.setObj(uid,"areaMail",ids[i],1)
					self.sendMail(uid,self.areaMailList[ids[i]].title,self.areaMailList[ids[i]].text,self.areaMailList[ids[i]].atts,1)
				}
			}
		})
	}
	//检测单个全服邮件
	this.checkAreaMailOne = function(uid,id) {
		var curTime = Date.now()
		var self = this
		if(curTime > self.areaMailList[id].beginTime && curTime < self.areaMailList[id].endTime){
			self.getObj(uid,"areaMail",id,function(data) {
				if(!data){
					self.setObj(uid,"areaMail",id,1)
					self.sendMail(uid,self.areaMailList[id].title,self.areaMailList[id].text,self.areaMailList[id].atts,1)
				}
			})
		}
	}
}