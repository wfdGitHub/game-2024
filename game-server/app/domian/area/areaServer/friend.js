//好友系统
const main_name = "friend_list"
const friend_apply = "friend_apply"
const friend_gift = "friend_gift"
const maxLen = 20
const gift_award = "214:100"
const async = require("async")
module.exports = function() {
	var self = this
	var local = {}
	//好友列表
	this.getFriendList = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			if(!data)
				data = {}
			var arr = []
			for(var i in data){
				arr.push(i)
			}
			self.getFriendByUids(uid,arr,function(userInfos) {
				cb(true,userInfos)
			})
		})
	}
	//ID搜索
	this.searchFriendById = function(uid,target,cb) {
		self.redisDao.db.sismember("area:area"+self.areaId+":userSet",target,function(err,data) {
			if(!data){
				cb(false,"该玩家不存在")
			}
			self.getPlayerBaseByUids([target],function(userInfos) {
				cb(true,userInfos[0])
			})
		})
	}
	//换一批好友
	this.searchFriendBatch = function(cb) {
		self.redisDao.db.srandmember("area:area"+self.areaId+":userSet",10,function(err,data) {
			self.getPlayerBaseByUids(data,function(userInfos) {
				cb(true,userInfos)
			})
		})
	}
	//申请列表
	this.getApplyFriendList = function(uid,cb) {
		self.getObjAll(uid,friend_apply,function(data) {
			if(!data)
				data = {}
			var arr = []
			for(var i in data){
				arr.push(i)
			}
			self.getPlayerBaseByUids(arr,function(userInfos) {
				cb(true,userInfos)
			})
		})
	}
	//请求添加
	this.applyAddFriend = function(uid,target,cb) {
		if(uid == target){
			cb(false,"不能添加自己")
			return
		}
		//判断是否已添加好友
		self.getObj(uid,main_name,target,function(data) {
			if(data){
				cb(false,"已添加为好友")
			}else{
				self.setObj(target,friend_apply,uid,Date.now())
				self.getPlayerBaseByUids([uid],function(userInfos) {
					var notify = {
						type : "applyAddFriend",
						userInfo : userInfos[0]
					}
					self.sendToUser(target,notify)
					cb(true)
				})
			}
		})
	}
	//同意申请
	this.agreeAddFriend = function(uid,target,cb) {
		async.waterfall([
			function(next) {
				//判断申请是否存在
				self.getObj(uid,friend_apply,target,function(data) {
					if(!data){
						next("申请不存在")
					}else{
						next()
					}
				})
			},
			function(next) {
				//判断自己好友列表长度
				self.getObjLen(uid,main_name,function(data) {
					if(data && data >= maxLen){
						next("你的好友已满")
					}else{
						next()
					}
				})
			},
			function(next) {
				//判断对方好友列表长度
				self.getObjLen(target,main_name,function(data) {
					if(data && data >= maxLen){
						next("对方好友已满")
					}else{
						next()
					}
				})
			},
			function(next) {
				//添加好友
				self.delObj(uid,friend_apply,target)
				local.addFriend(uid,target)
				local.addFriend(target,uid)
				cb(true)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//拒绝申请
	this.refuseAddFriend = function(uid,list,cb) {
		for(var i = 0;i < list.length;i++){
			self.delObj(uid,friend_apply,list[i])
		}
		cb(true)
	}
	//删除好友
	this.delFriend = function(uid,target,cb) {
		async.waterfall([
			function(next) {
				//判断好友是否存在
				self.getObj(uid,main_name,target,function(data) {
					if(data){
						next()
					}else{
						next("好友不存在")
					}
				})
			},
			function(next) {
				local.delFriend(uid,target)
				cb(true)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//赠送
	this.sendFriendGift = function(uid,list,cb) {
		if(!list || !list.length){
			cb(false,"list error")
			return
		}
		async.waterfall([
			function(next) {
				//判断好友是否存在
				self.getHMObj(uid,main_name,list,function(data) {
					for(var i = 0;i < data.length;i++){
						if(!data[i]){
							next("好友不存在"+list[i])
							return
						}
					}
					next()
				})
			},
			function(next) {
				//判断是否已赠送
				var arr = []
				for(var i = 0;i < list.length;i++)
					arr.push(list[i]+"_"+uid)
				self.getAreaHMObj(friend_gift,arr,function(data) {
					for(var i = 0;i < data.length;i++){
						if(data[i]){
							next("已赠送"+list[i])
							return
						}
					}
					next()
				})
			},
			function(next) {
				for(var i = 0;i < list.length;i++)
					local.sendFriendGift(uid,list[i])
				cb(true)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//领取礼物
	this.gainFriendGift = function(uid,list,cb) {
		if(!list || !list.length){
			cb(false,"list error")
			return
		}
		async.waterfall([
			function(next) {
				//判断好友是否存在
				self.getHMObj(uid,main_name,list,function(data) {
					for(var i = 0;i < data.length;i++){
						if(!data[i]){
							next("好友不存在"+list[i])
							return
						}
					}
					next()
				})
			},
			function(next) {
				//判断是否可领取
				var arr = []
				for(var i = 0;i < list.length;i++)
					arr.push(uid+"_"+list[i])
				self.getAreaHMObj(friend_gift,arr,function(data) {
					for(var i = 0;i < data.length;i++){
						if(data[i] != 1){
							next("该礼物不可领取"+list[i])
							return
						}
					}
					next()
				})
			},
			function(next) {
				for(var i = 0;i < list.length;i++)
					self.setAreaObj(friend_gift,uid+"_"+list[i],2)
				var awardList = self.addItemStr(uid,gift_award,list.length)
				cb(true,awardList)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//删除好友
	local.delFriend = function(uid,target) {
		self.delObj(uid,main_name,target)
		self.sendToUser(uid,{type : "delFriend",uid : target})
		self.delObj(target,main_name,uid)
		self.sendToUser(target,{type : "delFriend",uid : uid})
	}
	//添加好友
	local.addFriend = function(uid,target) {
		self.setObj(uid,main_name,target,Date.now())
		self.getFriendByUids(uid,[target],function(userInfos) {
			var notify = {
				type : "addFriend",
				userInfo : userInfos[0]
			}
			self.sendToUser(uid,notify)
		})
	}
	//增送礼物
	local.sendFriendGift = function(uid,target) {
		self.setAreaObj(friend_gift,target+"_"+uid,1)
		var notify = {
			type : "friendGift",
			uid : uid
		}
		self.sendToUser(target,notify)
	}
}