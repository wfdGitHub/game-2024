//邮件系统
var uuid = require("uuid")
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
	//发送邮件
	this.sendMail = function(uid,title,text,atts,cb) {
		var mailInfo = {
			title : title,
			text : text,
			id : uuid.v1(),
			time : Date.now()
		}
		if(atts){
			mailInfo.atts = atts
		}
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
					var atts = mailInfo.atts
					self.addItemStr(uid,atts)
					if(cb)
						cb(true,atts)
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
					awardList.push(mailInfo.atts)
					self.gainMailAttachment(uid,i,mailInfo.id)
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
		self.redisDao.db.hgetall("area:area"+self.areaId+":areaMail",function(err,data) {
			self.areaMailList = {}
			for(var id in data){
				self.areaMailList[id] = JSON.parse(data[id])
			}
			console.log(self.areaMailList)
		})
	}
	//全服邮件每日更新
	this.dayUpdateAreaMail = function() {
		var curTime = Date.now()
		for(var id in this.areaMailList){
			if(curTime > this.areaMailList[id]){
				delete this.areaMailList[id]
				this.redisDao.db.hdel("area:area"+this.areaId+":areaMail",id)
			}
		}
	}
	//设置全服邮件
	this.setAreaMail = function(title,text,atts,time,cb) {
		var id = uuid.v1()
		var areaMailInfo = {
			title : title,
			text : text,
			atts : atts,
			time : time
		}
		var self = this
		self.redisDao.db.hset("area:area"+this.areaId+":areaMail",id,JSON.stringify(areaMailInfo),function(err) {
			if(!err){
				self.areaMailList[id] = areaMailInfo
				for(var uid in self.players){
					self.checkAreaMailOne(uid,id)
				}
			}
		})
		cb(true,{id:id,areaMailInfo:areaMailInfo})
	}
	//获取全服邮件
	this.getAreaMailList = function(cb) {
		cb(true,this.areaMailList)
	}
	//删除全服邮件
	this.deleteAreaMailList = function(id,cb) {
		if(this.areaMailList[id]){
			delete this.areaMailList[id]
			this.redisDao.db.hdel("area:area"+this.areaId+":areaMail",id)
			cb(true)
		}else{
			cb(false,"邮件不存在")
		}
	}
	//检测所有全服邮件
	this.checkAreaMailAll = function(uid) {
		var ids = []
		var self = this
		for(var id in self.areaMailList){
			ids.push(id)
		}
		self.getHMObj(uid,"areaMail",ids,function(list) {
			for(var i = 0;i < ids.length;i++){
				if(!list || !list[i]){
					self.setObj(uid,"areaMail",ids[i],1)
					self.sendMail(uid,self.areaMailList[id].title,self.areaMailList[id].text,self.areaMailList[id].atts)
				}
			}
		})
	}
	//检测单个全服邮件
	this.checkAreaMailOne = function(uid,id) {
		var self = this
		self.getObj(uid,"areaMail",id,function(data) {
			if(!data){
				self.setObj(uid,"areaMail",id,1)
				self.sendMail(uid,self.areaMailList[id].title,self.areaMailList[id].text,self.areaMailList[id].atts)
			}
		})
	}
}