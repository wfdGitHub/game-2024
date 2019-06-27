var bearcat = require("bearcat")
var adminChat = function(app) {
  this.app = app
  this.chat = this.app.get("chat")
}
//获取聊天室列表
adminChat.prototype.getChatRooms = function(msg, session, next) {
  var limit = session.get("limit")
  if(!limit || limit < 10){
    next(null,{flag : false})
    return
  }
  var list = []
  for(var i in this.chat.rooms){
    list.push(i)
  }
  next(null,{flag : true,list : list})
}
//获取聊天室内成员
adminChat.prototype.getMembers = function(msg, session, next) {
  var limit = session.get("limit")
  if(!limit || limit < 10){
    next(null,{flag : false})
    return
  }
  var roomName = msg.roomName
  var list = []
  if(this.chat.rooms[roomName]){
    list = this.chat.rooms[roomName].getMembers()
  }
  next(null,{flag : true,list : list})
}
module.exports = function(app) {
  return bearcat.getBean({
    id : "adminChat",
    func : adminChat,
    args : [{
      name : "app",
      value : app
    }]
  })
}