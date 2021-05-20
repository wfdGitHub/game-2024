//外观展示
const frame_list = require("../../../../config/gameCfg/frame_list.json")
const title_list = require("../../../../config/gameCfg/title_list.json")
const skin_list = require("../../../../config/gameCfg/skin_list.json")
const heros = require("../../../../config/gameCfg/heros.json")
const async = require("async")
const oneDayTime = 86400000
module.exports = function() {
	var self = this
	//改变头像
	this.changeHead = function(uid,id,cb) {
		self.getObj(uid,"heroArchive",id,function(data) {
			if(data){
				self.chageLordData(uid,"head",id)
				cb(true)
			}else{
				cb(false,"未获得该英雄")
			}
		})
	}
	//改变形象
	this.changeFigure = function(uid,id,cb) {
		self.getObj(uid,"heroArchive",id,function(data) {
			if(data){
				self.chageLordData(uid,"figure",id)
				cb(true)
			}else{
				cb(false,"未获得该英雄")
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
			if(cb)
				cb(false,"title id error "+id)
			return
		}
		self.getObj(uid,"title_list",id,function(data) {
			if(data == -1){
				if(cb)
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
			if(cb)
				cb(true)
		})
	}
	//改变称号
	this.changeUserTitle = function(uid,id,cb) {
		if(id == 0){
			self.chageLordData(uid,"title",id)
			self.setTitle(uid,id)
			cb(true)
		}else{
			self.getObj(uid,"title_list",id,function(data) {
				if(data && (data == -1 || Number(data) >= Date.now())){
					self.chageLordData(uid,"title",id)
					self.setTitle(uid,id)
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
			if(cb)
				cb(false,"frame id error "+id)
			return
		}
		self.getObj(uid,"frame_list",id,function(data) {
			if(data == -1){
				if(cb)
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
			if(cb)
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
	//过期检查 头像框 称号
	this.overdueCheck = function(uid,cb) {
		var title = self.getLordAtt(uid,"title")
		var frame = self.getLordAtt(uid,"frame")
		var info = {
			title : title,
			frame : frame
		}
		async.waterfall([
			function(next) {
				if(title){
					self.getObj(uid,"title_list",title,function(data) {
						if(!(data && (data == -1 || Number(data) >= Date.now()))){
							info.title = 0
							self.chageLordData(uid,"title",0)
							self.setTitle(uid,0)
						}
						next()
					})
				}else{
					next()
				}
			},
			function(next) {
				if(frame){
					self.getObj(uid,"frame_list",frame,function(data) {
						if(!(data && (data == -1 || Number(data) >= Date.now()))){
							info.frame = 0
							self.chageLordData(uid,"frame",0)
						}
						next()
					})
				}else{
					next()
				}
			},
			function(next) {
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//激活英雄皮肤
	this.gainHeroSkin = function(uid,id,cb) {
		if(!skin_list[id]){
			if(cb)
				cb(false,"皮肤不存在")
			return
		}
		self.getObj(uid,"heroArchive",id,function(data) {
			if(data){
				self.sendMail(uid,skin_list[id]["name"]+"皮肤转换","您已获得"+skin_list[id]["name"]+"皮肤,多出的皮肤已为您转换为元宝","202:3000")
			}else{
				self.setObj(uid,"heroArchive",id,Date.now())
				var notify = {
					"type" : "gainHeroSkin",
					"id" : id
				}
				self.sendToUser(uid,notify)
			}
			if(cb)
				cb(true)
		})
	}
	//改变英雄皮肤
	this.changeHeroSkin = function(uid,hId,index,cb) {
		var skinId
		async.waterfall([
			function(next) {
				self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
					if(!flag){
						cb(false,"英雄不存在")
						return
					}
					var heroId = heroInfo.id
					if(index == 0){
						skinId = 0
						next(null,heroInfo)
					}else if(heros[heroId] && heros[heroId]["skin_"+index]){
						skinId = heros[heroId]["skin_"+index]
						next(null,heroInfo)
					}else{
						cb(false,"index error")
					}
				})
			},
			function(heroInfo,next) {
				if(skinId == 0){
					delete heroInfo["skin"]
					self.heroDao.delHeroInfo(self.areaId,uid,hId,"skin")
					cb(true,heroInfo)
				}else{
					self.getObj(uid,"heroArchive",heroInfo.id+"_"+index,function(data) {
						if(!data){
							cb(false,"未获得该皮肤")
							return
						}
						heroInfo["skin"] = skinId
						self.heroDao.setHeroInfo(self.areaId,uid,hId,"skin",heroInfo["skin"])
						cb(true,heroInfo)
					})
				}

			}
		],function(err) {
			cb(false,err)
		})
	}
}