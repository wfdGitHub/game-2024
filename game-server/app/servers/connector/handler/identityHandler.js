var bearcat = require("bearcat")
var http = require('http')
var querystring = require("querystring")
var appcode = "b71d582d27ac479f9fbc377c7b1bfdf6"
//身份认证
var identityHandler = function(app) {
  	this.app = app;
};
var local = {}
identityHandler.prototype.bindIdentity = function(msg, session, next) {
	var accId = session.get("accId")
	var idcard = msg.idcard
	var name = msg.name
	if(!accId){
		next(null,{flag : false,err : "未登录账号"})
		return
	}
	var idcardReg = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
	if(!idcardReg.test(idcard)) {
		next(null,{flag : false,err : "身份证号错误"})
		return
	}
	if(typeof(name) != "string"){
		next(null,{flag : false,err : "名称错误"})
		return
	}
	var self = this
	self.accountDao.getAccountData({accId : accId,name : "idcard"},function(flag,data) {
		if(flag || data){
			next(null,{flag : false,err : "已绑定身份证"})
			return
		}
		local.checkIdentity(idcard,name,function(flag,data) {
			if(flag && data){
				self.accountDao.setAccountData({accId : accId,name : "idcard",value : JSON.stringify(data)})
			}
			next(null,{flag : flag,data : data})
		})
	})
}
local.checkIdentity = function(idcard,name,cb) {
	//身份认证appcode
	var postData=querystring.stringify({  
	    "idcard":idcard,
	    "name" : name
	})
	var options={
	  hostname:'eid.shumaidata.com',
	  path:'/eid/check',
	  method:'POST',
	  headers:{
	    "Content-Type":"application/x-www-form-urlencoded; charset=utf-8",
	    'Authorization':"APPCODE "+appcode,
	    "Content-Length" : postData.length
	  }
	}
    var req=http.request(options,function(res){
	  var _data='';
	  res.on('data', function(chunk){
	     _data += chunk;
	  });
	  res.on('end', function(){
	  	var data = JSON.parse(_data)
	     if(data && data.code == "0" && data.message == "成功"){
	     	cb(true,data.result)
	     }else{
	     	cb(false,data)
	     }
	   });
    })
    req.on('error', function(e) {
      cb(false,e)
    })
    req.write(postData);
    req.end()
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "identityHandler",
  	func : identityHandler,
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
// checkIdentity("46010319930702182X","王福德",function(data) {
// 	console.log("data",data)
// })

// { code: '0',
// message: '成功',
// result:
// { name: name,
// idcard: name,
// res: '1',
// description: '一致',
// sex: '男',
// birthday: '19930702',
// address: '海南省海口市新华区' } }

// { code: '400', message: 'Invalid id_number', result: null }