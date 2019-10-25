var bearcat = require("bearcat")
var chatHandler = function(app) {
	this.app = app
	this.chat = this.app.get("chat")
}
//加入聊天室
chatHandler.prototype.joinChatRoom = function(msg, session, next) {
	console.log("joinChatRoom")
	var uid = session.uid
	var sid = session.frontendId
	var roomName = msg.roomName
	if(!roomName || typeof("roomName") !== "string" || roomName.length > 10){
		console.log(typeof("roomName"),roomName.length)
		next(null,{flag : false,err : "roomName error "+roomName})
		return
	}
	this.chat.joinChatRoom(uid,sid,roomName,function(flag,msg){
		next(null,{flag : flag,msg : msg})
	})
}
//离开聊天室
chatHandler.prototype.leaveChatRoom = function(msg, session, next) {
	var uid = session.uid
	var sid = session.frontendId
	var roomName = msg.roomName
	if(!roomName || typeof("roomName") !== "string" || roomName.length > 10){
		next(null,{flag : false,err : "roomName error "+roomName})
		return
	}
	this.chat.leaveChatRoom(uid,sid,roomName,function(flag,msg){
		next(null,{flag : flag,msg : msg})
	})
}
//发送聊天消息
chatHandler.prototype.say = function(msg, session, next) {
	var roomName = msg.roomName
	if(!roomName || typeof("roomName") !== "string" || roomName.length > 10){
		next(null,{flag : false,err : "roomName error "+roomName})
		return
	}
	var uid = session.uid
	var nickname = session.get("nickname")
	var talker = {
		uid : uid,
		nickname : nickname
	}
	var text = msg.text
	this.chat.say(talker,roomName,text)
	next(null)
}
module.exports = function(app) {
	return bearcat.getBean({
		id : "chatHandler",
		func : chatHandler,
		args : [{
			name : "app",
			value : app
		}]
	})
}