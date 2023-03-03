//兵符  等级  品质  属性   数值
const bingfu_lv = require("../../../../config/gameCfg/bingfu_lv.json")
const bingfu_att = require("../../../../config/gameCfg/bingfu_att.json")
const bingfu_type = require("../../../../config/gameCfg/bingfu_type.json")
const talent_list = require("../../../../config/gameCfg/talent_list.json")
const util = require("../../../../util/util.js")
const washItem = 1000310
const refineItem = 1000320
var bingfu_type_cfg = {}
var bingfu_type_map = []
var bingfu_lv_cfg = {}
var model = function() {
	bingfu_type_cfg = JSON.parse(JSON.stringify(bingfu_type))
	for(var type in bingfu_type_cfg){
		bingfu_type_cfg[type]["main_att"] = JSON.parse(bingfu_type_cfg[type]["main_att"])
		bingfu_type_cfg[type]["sec_att"] = JSON.parse(bingfu_type_cfg[type]["sec_att"])
		bingfu_type_map.push(type)
	}
	bingfu_lv_cfg = JSON.parse(JSON.stringify(bingfu_lv))
	for(var i in bingfu_lv_cfg){
		for(var j = 2;j <= 5;j++){
			bingfu_lv_cfg[i]["QR_"+j] += bingfu_lv_cfg[i]["QR_"+(j-1)]
		}
	}
}
//数据构造
// {
// 	"atk" : {
//		"id" : "1",
// 		"type" : "atk",
// 		"lv" : 1,
// 		"qa" : 1,
// 		"main" : [17,18,20],
// 		"sec_att" : [11010,11020,11030],
// 		"sec_vel" : [10,15,20]
// 	},
// 	"def" : "",
// 	"spe" : ""
// }
//生成兵符
model.prototype.createBingfu = function(type,lv,qa,sec_att,sec_vel) {
	var bfInfo = {}
	//类型  没有则随机
	bfInfo.type = bingfu_type[type] ? type : bingfu_type_map[Math.floor(Math.random() * bingfu_type_map.length)]
	//等级  没有默认1级
	bfInfo.lv = bingfu_lv[lv] ? lv : 1
	//品质  没有按照规则随机
	bfInfo.qa = (qa >= 1 && qa <= 5) ? Math.floor(qa) : this.randQuality(bfInfo.lv)
	//主属性
	this.randMainVel(bfInfo)
	//次属性
	this.randSecVel(bfInfo,sec_att,sec_vel)
	this.saveTmpData(bfInfo)
	return bfInfo
}
//生成随机品质
model.prototype.randQuality = function(lv) {
	var rand = Math.random() * bingfu_lv_cfg[lv]["QR_5"]
	quality = 1
	for(var i = 1;i <= 5;i++){
		if(rand < bingfu_lv_cfg[lv]["QR_"+i]){
			quality = i
			break
		}
	}
	return quality
}
//生成主属性
model.prototype.randMainVel = function(bfInfo) {
	//生成主属性
	var lv = bfInfo.lv
	var qa = bfInfo.qa
	var maxValue = bingfu_lv_cfg[lv]["Q"+qa]
	var minValue = bingfu_lv_cfg[lv]["Q"+(qa-1)]
	var baseValue = util.randomFrom(minValue,maxValue)
	var count = 3
	var overValue = (baseValue - minValue) * count
	var attList = util.randomFigure(overValue,count)
	for(var i = 0;i < count;i++)
		attList[i] += minValue
	bfInfo.main = attList
	return bfInfo
}
//洗练兵符
model.prototype.washBingfu = function(bfInfo) {
	var tmpInfo = JSON.parse(JSON.stringify(bfInfo))
	if(tmpInfo.qa != 5)
		tmpInfo.qa = this.randQuality(tmpInfo.lv)
	tmpInfo = this.createBingfu(tmpInfo.type,tmpInfo.lv,tmpInfo.qa)
	bfInfo.tmp = tmpInfo
	return bfInfo
}
//生成次级属性
model.prototype.randSecVel = function(bfInfo,sec_att,sec_vel) {
	var tmpInfo = JSON.parse(JSON.stringify(bfInfo))
	//品质不高于主属性
	var type = tmpInfo.type
	var lv = tmpInfo.lv
	var qa = tmpInfo.qa
	qa = util.randomFrom(1,qa)
	var maxValue = bingfu_lv_cfg[lv]["Q"+qa]
	var minValue = bingfu_lv_cfg[lv]["Q"+(qa-1)]
	var baseValue = util.randomFrom(minValue,maxValue)
	var count = bingfu_lv_cfg[lv]["sec_num"]
	var overValue = (baseValue - minValue) * count
	if(!sec_vel){
		sec_vel = util.randomFigure(overValue,count)
		for(var i = 0;i < count;i++)
			sec_vel[i] += minValue
	}
	tmpInfo.sec_vel = sec_vel
	if(sec_att)
		tmpInfo.sec_att = sec_att
	else
		tmpInfo.sec_att = util.getRandomArray(bingfu_type_cfg[type]["sec_att"],count)
	bfInfo.tmp = tmpInfo
	return bfInfo
}
//获取兵符数据
model.prototype.callBingfuData = function(bfStr) {
	var bfAtt = {}
	if(bfStr){
		var bfInfo = JSON.parse(bfStr)
		for(var type in bfInfo){
			if(bfInfo[type]){
				//主属性
				for(var i = 0;i < 3;i++){
					var attInfo = bingfu_att[bingfu_type_cfg[type]["main_att"][i]]
					if(attInfo)
						bfAtt[attInfo.talent] = Number((attInfo.basic * bfInfo[type]["main"][i]).toFixed(3))
				}
				//次级属性
				for(var i = 0;i < bfInfo[type]["sec_att"].length;i++){
					var attInfo = bingfu_att[bfInfo[type]["sec_att"][i]]
					if(attInfo)
						bfAtt[attInfo.talent] = Number((attInfo.basic * bfInfo[type]["sec_vel"][i]).toFixed(3))
				}
			}
		}
	}
	return bfAtt
}
//获取兵符属性文案
model.prototype.getBingfuDes = function(bfInfo) {
	var bfDes = {}
	bfDes.name = bingfu_type[bfInfo.type]["name"]
	bfDes.lv = bfInfo.lv
	bfDes.quality = bfInfo.qa
	bfDes.mainAtt = []
	for(var i = 0;i < 3;i++){
		var attInfo = bingfu_att[bingfu_type_cfg[bfInfo.type]["main_att"][i]]
		if(attInfo){
			bfDes.mainAtt[i] =  {"name" : talent_list[attInfo.talent]["name"]}
			if(attInfo.number)
				bfDes.mainAtt[i].value = "+"+Number((attInfo.basic * bfInfo["main"][i]))
			else
				bfDes.mainAtt[i].value = "+"+(attInfo.basic * bfInfo["main"][i] * 100).toFixed(1)+"%"
		}
	}
	bfDes.secAtt = []
	for(var i = 0;i < bfInfo["sec_att"].length;i++){
		var attInfo = bingfu_att[bfInfo["sec_att"][i]]
		if(attInfo){
			bfDes.secAtt[i] =  {"name" : talent_list[attInfo.talent]["name"],"qa":0}
			if(attInfo.number)
				bfDes.secAtt[i].value = "+"+Number((attInfo.basic * bfInfo["sec_vel"][i]))
			else
				bfDes.secAtt[i].value = "+"+(attInfo.basic * bfInfo["sec_vel"][i] * 100).toFixed(1)+"%"
			for(var j = 0;j <= 5;j++){
				if(bfInfo["sec_vel"][i] < bingfu_lv_cfg[bfDes.lv]["Q"+j]){
					break
				}else{
					bfDes.secAtt[i]["qa"] = j
				}
			}
		}
	}
	return bfDes
}
//获取兵符属性范围
model.prototype.getBingfuDataRange = function(bfInfo) {
	var info = {}
	var maxValue = bingfu_lv_cfg[bfInfo.lv]["Q4"]
	var minValue = bingfu_lv_cfg[bfInfo.lv]["Q0"]
	info.mainAtt = []
	for(var i = 0;i < 3;i++){
		var attInfo = bingfu_att[bingfu_type_cfg[bfInfo.type]["main_att"][i]]
		info.mainAtt[i] =  {"name" : talent_list[attInfo.talent]["name"]}
		if(attInfo.number)
			info.mainAtt[i].value = "+"+Number((attInfo.basic * minValue))+"~"+Number((attInfo.basic * maxValue))
		else
			info.mainAtt[i].value = "+"+(attInfo.basic * minValue * 100).toFixed(1)+"%"+"~"+(attInfo.basic * maxValue * 100).toFixed(1)+"%"
	}
	info.secAtt = []
	for(var i = 0;i < bingfu_type_cfg[bfInfo.type]["sec_att"].length;i++){
		var attInfo = bingfu_att[bingfu_type_cfg[bfInfo.type]["sec_att"][i]]
		info.secAtt[i] =  {"name" : talent_list[attInfo.talent]["name"]}
		if(attInfo.number)
			info.secAtt[i].value = "+"+Number((attInfo.basic * minValue))+"~"+Number((attInfo.basic * maxValue))
		else
			info.secAtt[i].value = "+"+(attInfo.basic * minValue * 100).toFixed(1)+"%"+"~"+(attInfo.basic * maxValue * 100).toFixed(1)+"%"
	}
	return info
}
//获取兵符洗练消耗
model.prototype.getWashPcStr = function(bfInfo) {
	var count = bingfu_lv[bfInfo["lv"]]["wash"]
	if(bfInfo.qa == 5)
		count *= 2
	var pcStr = washItem+":"+count
	return pcStr
}
//获取兵符精炼消耗
model.prototype.getRefinePcStr = function(bfInfo) {
	return washItem+":"+bingfu_lv[bfInfo["lv"]]["wash"]+"&"+refineItem+":"+bingfu_lv[bfInfo["lv"]]["refine"]
}
//获取兵符分解返还
model.prototype.getResolveItem = function(bfList) {
	var washValue = 0
	var refineValue = 0
	for(var i = 0;i < bfList.length;i++){
		washValue += bingfu_lv[bfList[i].lv]["pr_wash"]
		if(bfList[i].qa == 5)
			refineValue += bingfu_lv[bfList[i].lv]["pr_refine"]
	}
	var pcStr = washItem+":"+washValue
	if(refineValue)
		pcStr += "&"+refineItem+":"+refineValue
	return pcStr
}
//获取兵符战力
model.prototype.getBfDataCE = function(bfData) {
	var CE = 0
	if(bfData){
		bfData = JSON.parse(bfData)
		for(var type in bfData)
			CE += this.getBingfuCE(bfData[type])
	}
	return CE
}
//获取兵符总战力
model.prototype.getBingfuCE = function(bfInfo) {
	var CE = 0
	var count = bfInfo["qa"] * bfInfo["qa"]
	for(var i  = 0;i < bfInfo["main"].length;i++)
		count += bfInfo["main"][i]
	for(var i  = 0;i < bfInfo["sec_vel"].length;i++)
		count += bfInfo["sec_vel"][i]
	CE = count * bingfu_lv[bfInfo["lv"]]["ce"]
	return CE
}
//保存兵符临时属性
model.prototype.saveTmpData = function(bfInfo) {
	if(bfInfo.tmp){
		for(var i in bfInfo.tmp)
			bfInfo[i] = bfInfo.tmp[i]
		delete bfInfo.tmp
	}
	return bfInfo
}
module.exports = new model()

// var test = new model()
// var bfInfo = {
// 		"id" : "1",
// 		"type" : "atk",
// 		"lv" : 4,
// 		"qa" : 5,
// 		"main" : [20,18,20],
// 		"sec_att" : [11010,11020,11030],
// 		"sec_vel" : [10,15,20]
// 	}
// console.log(test.getBfDataCE(JSON.stringify({"atk":bfInfo,"def":bfInfo})))