var bearcat = require("bearcat")

var entryHandler = function(app) {
  this.app = app;
  this.sessionService = this.app.get('sessionService')
  this.areaDeploy = this.app.get('areaDeploy')
  this.connectorManager = this.app.get('connectorManager')
};
//登陆账号
entryHandler.prototype.entryAccount = function(msg, session, next) {
	var unionid = msg.unionid
	var self = this
	self.accountDao.getAccountInfo(msg,function(flag,userInfo) {
		if(!flag || !userInfo){
			self.accountDao.createAccount(msg,function(flag,data) {
				if(!flag || !data){
					next(null,{flag : false,msg : data})
					return
				}
				entryHandler.entrySuccess.call(self,session,data,next)
			})
		}else{
			entryHandler.entrySuccess.call(self,session,userInfo,next)
		}
	})
}
//登录成功
entryHandler.entrySuccess = function(session,userInfo,next) {
	var uid = Number(userInfo.uid)
	//检查重复登录
	if( !! this.sessionService.getByUid(uid)) {
		this.connectorManager.sendByUid(uid,{type : "kick"})
		var uids = this.sessionService.getByUid(uid)
		for(var i = 0;i < uids.length;i++){
			this.sessionService.kickBySessionId(uids[i].id)
		}
	}
	session.bind(uid)
	session.set("nickname",userInfo.nickname)
	session.set("head",userInfo.head)
	session.on("closed",onUserLeave.bind(this))
	console.log(uid + "  entrySuccess.."+ "  "+this.app.serverId)
	userInfo.time = Date.now()
  	next(null, {flag : true,msg : userInfo});
}
var onUserLeave = function(session) {
	var uid = session.uid
	console.log("onUserLeave : "+uid + "  "+this.app.serverId)
	if(uid){
		session.unbind(uid)
		var serverId = session.get("serverId")
		if(serverId){
			this.app.rpc.area.areaRemote.userLeave.toServer(serverId,uid,this.app.serverId,null)
		}
		this.app.rpc.chat.chatRemote.userLeave(null,uid,this.app.serverId,null)
	}
}

module.exports = function(app) {
  return bearcat.getBean({
  	id : "entryHandler",
  	func : entryHandler,
	args : [{
		name : "app",
		value : app
	}],
  	props : [{
  		name : "accountDao",
  		ref : "accountDao"
  	}]
  })
};