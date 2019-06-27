//聊天服务器组件
var chat = function() {
	this.name = "chat"
	this.rooms = {}				//聊天室群组
	this.userMap = {}			//玩家所在聊天室
}
//初始化
chat.prototype.init = function(app) {
	this.app = app
	this.channelService = this.app.get('channelService')
}
//发送聊天消息
chat.prototype.say = function(talker,roomName,text,cb) {
	if(this.rooms[roomName] && this.rooms[roomName].getMember(talker.uid) && typeof(text) === "string" && text.length < 1000){
		var notify = {
			roomName : roomName,
			talker : talker,
			text : text
		}
		this.rooms[roomName].pushMessage("onChat",notify)
	}
}

//玩家加入聊天室
chat.prototype.joinChatRoom = function(uid,sid,roomName,cb) {
	console.log("joinChatRoom",uid,sid,roomName)
	if(this.userMap[uid] && this.userMap[uid][roomName]){
		cb(false,"已加入聊天室")
		return
	}
	if(!this.rooms[roomName]){
		this.rooms[roomName] = this.channelService.createChannel(roomName)
	}
	this.rooms[roomName].add(uid,sid)
	if(!this.userMap[uid]){
		this.userMap[uid] = {}
	}
	this.userMap[uid][roomName] = sid
	if(cb)
		cb(true)
}
//玩家离开聊天室
chat.prototype.leaveChatRoom = function(uid,sid,roomName,cb) {
	console.log("退出聊天室",roomName)
	if(this.userMap[uid] && this.userMap[uid][roomName] && this.rooms[roomName]){
		this.rooms[roomName].leave(uid,sid)
		delete this.userMap[uid][roomName]
		if(this.rooms[roomName].getUserAmount() <= 0){
			this.rooms[roomName].destroy()
			delete this.rooms[roomName]
		}
		if(cb)
			cb(true)
	}else{
		if(cb)
			cb(false,"未加入聊天室")
	}
}

//玩家离线
chat.prototype.userLeave = function(uid,sid) {
	if(this.userMap[uid]){
		for(var roomName in this.userMap[uid]){
			if(this.userMap[uid][roomName] === sid){
				this.leaveChatRoom(uid,sid,roomName)
			}
		}
	}
}

module.exports = {
	id : "chat",
	func : chat
}