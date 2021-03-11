//好友系统
const main_name = "friend_list"
const friend_apply = "friend_apply"
const maxLen = 20
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
			self.getPlayerBaseByUids(arr,function(userInfos) {
				cb(true,userInfos)
			})
		})
	}
	//ID搜索
	this.searchFriendById = function(uid,target,cb) {
		self.redisDao.db.sismember("area:area"+self.areaId+":userSet",target,function(err,data) {
			console.log("searchFriendById",err,data)
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
			console.log("searchFriendBatch",err,data)
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
				cb(true)
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
	this.refuseAddFriend = function(uid,target,cb) {
		self.delObj(uid,friend_apply,target)
		cb(true)
	}
	//赠送
	//领取
	//切磋
	//删除
	//添加好友
	local.addFriend = function(uid,target) {
		self.setObj(uid,main_name,target,Date.now())
		self.getPlayerBaseByUids([target],function(userInfos) {
			var notify = {
				type : "addFriend",
				userInfo : userInfos[0]
			}
			self.sendToUser(uid,notify)
		})
	}
}