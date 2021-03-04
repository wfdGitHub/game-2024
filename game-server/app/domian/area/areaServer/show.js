//外观展示
const frame_list = require("../../../../config/gameCfg/frame_list.json")
const title_list = require("../../../../config/gameCfg/title_list.json")
const oneDayTime = 86400000
module.exports = function() {
	var self = this
	//改变头像
	this.changeHead = function(uid,id,cb) {
		self.redisDao.db.hget("player:user:"+uid+":heroArchive",id,function(err,data) {
			if(err || !data){
				cb(false,"未获得该英雄")
			}else{
				self.chageLordData(uid,"head",id)
				cb(true)
			}
		})
	}
	//改变形象
	this.changeFigure = function(uid,id,cb) {
		self.redisDao.db.hget("player:user:"+uid+":heroArchive",id,function(err,data) {
			if(err || !data){
				cb(false,"未获得该英雄")
			}else{
				self.chageLordData(uid,"figure",id)
				cb(true)
			}
		})
	}
	//获取称号列表
	this.getUserTitleList = function(uid,cb) {
		self.getObjAll(uid,"title_list",function(data) {
			cb(true,data)
		})
	}
	//获得称号
	this.gainUserTitle = function(uid,id,cb) {
		if(!title_list[id]){
			cb(false,"title id error "+id)
			return
		}
		self.getObj(uid,"title_list",id,function(data) {
			if(data == -1){
				cb(true)
				return
			}
			data = Number(data)
			if(title_list[id]["time"] == -1){
				data = -1
			}else{
				if(!data || data < Date.now())
					data = Date.now()
				data += oneDayTime * title_list[id]["time"]
			}
			self.setObj(uid,"title_list",id,data)
			var notify = {
				"type" : "gainUserTitle",
				"id" : id,
				"time" : data
			}
			self.sendToUser(uid,notify)
			cb(true)
		})
	}
	//改变称号
	this.changeUserTitle = function(uid,id,cb) {
		if(id == 0){
			self.chageLordData(uid,"title",id)
			cb(true)
		}else{
			self.getObj(uid,"title_list",id,function(data) {
				if(data && (data == -1 || Number(data) >= Date.now())){
					self.chageLordData(uid,"title",id)
					cb(true)
				}else{
					cb(false,"该称号不能使用")
				}
			})
		}
	}
	//获取头像框列表
	this.getUserFrameList = function(uid,cb) {
		self.getObjAll(uid,"frame_list",function(data) {
			cb(true,data)
		})
	}
	//获得头像框
	this.gainUserFrame = function(uid,id,cb) {
		if(!frame_list[id]){
			cb(false,"frame id error "+id)
			return
		}
		self.getObj(uid,"frame_list",id,function(data) {
			if(data == -1){
				cb(true)
				return
			}
			data = Number(data)
			if(frame_list[id]["time"] == -1){
				data = -1
			}else{
				if(!data || data < Date.now())
					data = Date.now()
				data += oneDayTime * frame_list[id]["time"]
			}
			self.setObj(uid,"frame_list",id,data)
			var notify = {
				"type" : "gainUserFrame",
				"id" : id,
				"time" : data
			}
			self.sendToUser(uid,notify)
			cb(true)
		})
	}
	//改变头像框
	this.changeUserFrame = function(uid,id,cb) {
		if(id == 0){
			self.chageLordData(uid,"frame",id)
			cb(true)
		}else{
			self.getObj(uid,"frame_list",id,function(data) {
				if(data && (data == -1 || Number(data) >= Date.now())){
					self.chageLordData(uid,"frame",id)
					cb(true)
				}else{
					cb(false,"该称号不能使用")
				}
			})
		}
	}
}