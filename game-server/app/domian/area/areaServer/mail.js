//邮件系统
var uuid = require("uuid")
module.exports = function() {
	var self = this
	//获取最近一百封邮件
	this.getMailList = function(uid,cb) {
		this.redisDao.db.lrange("area:area"+this.areaId+":player:"+uid+":mail",-100,-1,function(err,list) {
			if(!err && list){
				cb(true,list)
			}else{
				cb(true,[])
			}
		})
	}
	//获取全部邮寄
	this.getMailAll = function(uid,cb) {
		this.redisDao.db.lrange("area:area"+this.areaId+":player:"+uid+":mail",0,-1,function(err,list) {
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
		this.redisDao.db.rpush("area:area"+this.areaId+":player:"+uid+":mail",mailInfo,function(err,data) {
			if(!err){
				var notify = {
					"type" : "newMail",
					"mailInfo" : mailInfo
				}
				self.sendToUser(uid,notify)
				cb(true,data)
			}else{
				cb(false,err)
			}
		})
	}
	//领取邮件附件
	this.gainMailAttachment = function(uid,index,id,cb) {
		self.redisDao.db.lindex("area:area"+self.areaId+":player:"+uid+":mail",index,function(err,data) {
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
			self.redisDao.db.lset("area:area"+self.areaId+":player:"+uid+":mail",index,JSON.stringify(mailInfo),function(err,data) {
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
		self.redisDao.db.lindex("area:area"+self.areaId+":player:"+uid+":mail",index,function(err,data) {
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
			self.redisDao.db.lset("area:area"+self.areaId+":player:"+uid+":mail",index,JSON.stringify(mailInfo),function(err,data) {
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
		self.redisDao.db.lindex("area:area"+self.areaId+":player:"+uid+":mail",index,function(err,data) {
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
			self.redisDao.db.lrem("area:area"+self.areaId+":player:"+uid+":mail",0,data,function(err,data) {
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
}