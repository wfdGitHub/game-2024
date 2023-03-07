//SKD支付模块
const util = require("../../../util/util.js")
var parseString = require('xml2js').parseString;
var model = function() {}
var local = {}
//初始化获取配置
model.prototype.init = function(cb) {
	this.sdkConfig = require("../../../config/sysCfg/sdkConfig.json")
}
//收到支付回调
model.prototype.pay_order = function(data,finish_callback,res) {
	switch(this.sdkConfig.sdk_type){
		case "quick":
			this.quick_order(data,finish_callback,res)
		break
		case "gzone":
		break
		case "277":
		break
	}
}
//quick订单
model.prototype.quick_order = function(data,finish_callback,res) {
	var v_sign = util.md5(data.nt_data+data.sign+this.sdkConfig["Md5_Key"])
	if(v_sign != data.md5Sign){
		console.error("签名验证失败")
		res.send("签名验证失败")
		return
	}
	var self = this
	var xmlStr = local.decode(data.nt_data,this.sdkConfig["Callback_Key"])
	parseString(xmlStr,function(err,result) {
		var message = result.quicksdk_message.message[0]
		var info = {
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
			extras_params : message["extras_params"]? message["extras_params"][0] : 0,
		}
		self.payDao.finishGameOrder(info,function(flag,err,data) {
			if(flag){
				//订单发货
				finish_callback(data.areaId,data.uid,data.amount,data.pay_id)
				res.send("SUCCESS")
			}else{
				res.send("FAILD "+err)
			}
		})
	});
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
module.exports = {
	id : "sdkPay",
	func : model,
	init : "init",
	props : [{
		name : "redisDao",
		ref : "redisDao"
	},{
		name : "payDao",
		ref : "payDao"
	}]
}