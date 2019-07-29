var bearcat = require("bearcat")

var entryHandler = function(app) {
  this.app = app;
  this.sessionService = this.app.get('sessionService')
  this.areaDeploy = this.app.get('areaDeploy')
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
		console.log("检测到重复登录",this.sessionService.getByUid(uid))
		for(var i in this.sessionService.getByUid(uid)){
			this.sessionService.kickBySessionId(this.sessionService.getByUid(uid)[i].id)
		}
	}
	session.bind(uid)
	session.set("uid",uid)
	session.push("uid")
	session.set("nickname",userInfo.nickname)
	session.push("nickname")
	session.set("head",userInfo.head)
	session.push("head")
	session.on("closed",onUserLeave.bind(this))
	console.log(session.get("uid") + "  entrySuccess..")
  	next(null, {flag : true,msg : userInfo});
}
var onUserLeave = function(session) {
	var uid = session.get("uid")
	console.log("onUserLeave : "+uid)
	if(uid){
		if(!session) {
			return
		}
		var serverId = session.get("serverId")
		if(serverId){
			this.app.rpc.area.areaRemote.userLeave.toServer(serverId,uid,null)
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