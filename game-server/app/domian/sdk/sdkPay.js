//SKD支付模块
const util = require("../../../util/util.js")
const parseString = require('xml2js').parseString;
const crypto = require("crypto")
const querystring = require("querystring")
const async = require("async")
var model = function() {}
var local = {}
//初始化获取配置
model.prototype.init = function(cb) {
	// console.log("SKD支付模块 初始化SDK配置")
	delete require.cache[require.resolve('../../../config/gameCfg/sdkConfig.json')]; 
	this.sdkConfig = require("../../../config/gameCfg/sdkConfig.json")
	for(var i in this.sdkConfig)
		if(Number.isFinite(this.sdkConfig[i]["value"]))
			this.sdkConfig[i]["value"] = this.sdkConfig[i]["value"].toFixed()
}
//收到支付回调
model.prototype.pay_order = function(data,finish_callback,req,res) {
	this.quick_order(data,finish_callback,req,res)
	// switch(this.sdkConfig.sdk_type["value"]){
	// 	case "quick":
	// 		this.quick_order(data,finish_callback,req,res)
	// 	break
	// 	// case "jianwan":
	// 	// 	this.jianwan_order(data,finish_callback,req,res)
	// 	// break
	// 	// case "277":
	// 	// 	this.game277_order(data,finish_callback,req,res)
	// 	// break
	// 	// case "x7sy":
	// 	// 	this.x7sy_order(data,finish_callback,req,res)
	// 	// break
	// }
}
//quick订单
model.prototype.quick_order = function(data,finish_callback,req,res) {
	var self = this
	var info = {}
	async.waterfall([
		function(next) {
			var v_sign = util.md5(data.nt_data+data.sign+self.sdkConfig["Md5_Key"]["value"])
			if(v_sign != data.md5Sign){
				console.error("签名验证失败")
				console.log(data)
				return
			}
			var xmlStr = local.decode(data.nt_data,self.sdkConfig["Callback_Key"]["value"])
			parseString(xmlStr,function(err,result) {
				var message = result.quicksdk_message.message[0]
				info = {
					is_test : message["is_test"]? message["is_test"][0] : 0,
					channel : message["channel"]? message["channel"][0] : 0,
					channel_name : message["channel_name"]? message["channel_name"][0] : 0,
					channel_uid : message["channel_uid"]? message["channel_uid"][0] : 0,
					channel_order : message["channel_order"]? message["channel_order"][0] : 0,
					game_order : message["game_order"]? message["game_order"][0] : 0,
					order_no : message["order_no"]? message["order_no"][0] : 0,
					pay_time : message["pay_time"]? message["pay_time"][0] : 0,
					amount : message["amount"]? message["amount"][0] : 0,
					status : message["status"]? message["status"][0] : 0,
					extras_params : message["extras_params"]? message["extras_params"][0] : {},
				}
				self.payDao.finishGameOrder(info,function(flag,err,orderData,orderOtps) {
					if(!flag)
						next(err)
					else{
						next(null,orderData,orderOtps)
					}
				})
			});
		},
		function(orderData,orderOtps,next) {
			//订单发货
			finish_callback(orderData.areaId,orderData.uid,orderData.amount,orderData.pay_id,info,function(flag,err) {
				if(flag){
					res.send("SUCCESS")
					self.payDao.updateRmb(orderOtps)
				}else{
					res.send(err)
				}
			})
		}
	],function(err) {
		console.error(err)
		cb(false,err)
	})
}
local.decode = function(str,key){
	if(str.length <= 0){
		return '';
	}
	var list = new Array();
	var resultMatch = str.match(/\d+/g);
	for(var i= 0;i<resultMatch.length;i++){
		list.push(resultMatch[i]);
	}
	if(list.length <= 0){
		return '';
	}
	var keysByte = local.stringToBytes(key);
	var dataByte = new Array();
	for(var i = 0 ; i < list.length ; i++){
		dataByte[i] = parseInt(list[i]) - (0xff & parseInt(keysByte[i % keysByte.length]));
	}
	if(dataByte.length <= 0){
		return '';
	}
	var parseStr = local.bytesToString(dataByte);
	return parseStr;
}
local.stringToBytes = function(str) {
	var ch, st, re = [];  
  	for (var i = 0; i < str.length; i++ ) {  
    	ch = str.charCodeAt(i);
    	st = []; 
    	do {  
      		st.push( ch & 0xFF );
      		ch = ch >> 8;
    	}while ( ch );  
    	re = re.concat( st.reverse() );  
	}  
  	return re;  
} 
local.bytesToString = function(array) {
  return String.fromCharCode.apply(String, array);
}
local.ksort = function(obj){
  let sortStr = "",
  keys = Object.keys(obj);
  keys.sort();
  for(var i = 0;i < keys.length;i++){
    if(i > 0){
        sortStr += "&"
    }
    sortStr += keys[i]+"="+obj[keys[i]]
  }
  return sortStr;
}
local.verifySignSHA1 = function(data, sign, publicKey) {
    const verify = crypto.createVerify('RSA-SHA1');
    verify.update(data);
    verify.end();
    return verify.verify(publicKey, Buffer.from(sign, 'base64'));
}
module.exports = {
	id : "sdkPay",
	func : model,
	init : "init",
	scope : "prototype",
	props : [{
		name : "redisDao",
		ref : "redisDao"
	},{
		name : "payDao",
		ref : "payDao"
	},{
		name : "cacheDao",
		ref : "cacheDao"
	}]
}