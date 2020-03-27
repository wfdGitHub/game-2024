const zhulu_cfg = require("../../../../config/gameCfg/zhulu_cfg.json")
const zhulu_dl = require("../../../../config/gameCfg/zhulu_dl.json")
const zhulu_shop = require("../../../../config/gameCfg/zhulu_shop.json")
const zhulu_spoils = require("../../../../config/gameCfg/zhulu_spoils.json")
const zhulu_award = require("../../../../config/gameCfg/zhulu_award.json")
const heros = require("../../../../config/gameCfg/heros.json")
var util = require("../../../../util/util.js")
var main_name = "zhulu"
var allWeight = 0
var normal_team = JSON.parse(zhulu_cfg["normal_team"]["value"])
var elite_team = JSON.parse(zhulu_cfg["elite_team"]["value"])
var boss_team = JSON.parse(zhulu_cfg["boss_team"]["value"])
var weights = {
	"elite":0,
	"normal":0,
	"heal":0,
	"resurgence":0,
	"shop":0
}
for(let type in weights){
	weights[type] = zhulu_cfg[type]["value"] + allWeight
	allWeight = weights[type]
}
var shopAllWeight = 0
var shopWeights = {}
for(var i in zhulu_shop){
	shopWeights[i] = Object.assign({},zhulu_shop[i])
	shopAllWeight += shopWeights[i].weight
	shopWeights[i].weight = shopAllWeight
}
var spoils_qualitys = {}
for(var i in zhulu_spoils){
	if(!spoils_qualitys[zhulu_spoils[i]["quality"]]){
		spoils_qualitys[zhulu_spoils[i]["quality"]] = []
	}
	spoils_qualitys[zhulu_spoils[i]["quality"]].push(zhulu_spoils[i])
}
var keysType = {
	dayStr : "string",
	curGrid : "num",
	curChoose : "num",
	surplus_healths :"obj",
	zhuluTeam : "obj",
	grids :"obj",
	gridList :"obj",
	spoils : "obj",
	spoils_list : "obj",
	chooseList :"obj",
	sellOutList : "obj"
}
var gridCounts = [1,2,3,2,3,2,3,2,3,2,1,2,3,2,3,2,3,2,3,2,1,2,3,2,3,2,3,2,3,2,1]
//逐鹿之战
module.exports = function() {
	var self = this
	var userDatas = {}
	var userFightDatas = {}
	var local = {}
	//加载逐鹿之战数据
	this.zhuluLoad = function(uid,next) {
		self.getObjAll(uid,main_name,function(data) {
			if(!data || self.dayStr != data.dayStr){
				data = {
					dayStr : (new Date()).toDateString(),
					curGrid : 0,
					curChoose : -1,
					surplus_healths : {},
					zhuluTeam : [],
					grids : {},
					gridList : {},
					spoils : [],
					spoils_list : [],
					chooseList : {},
					sellOutList : {}
				}
				// let fightTeam = self.getUserTeam(uid)
				// for(let i = 0;i < fightTeam.length;i++){
				// 	if(fightTeam[i] && fightTeam[i].hId)
				// 		data.zhuluTeam.push(fightTeam[i].hId)
				// 	else
				// 		data.zhuluTeam.push(null)
				// }
				// self.heroDao.setZhuluTeam(self.areaId,uid,data.zhuluTeam)
				for(let i = 1;i < gridCounts.length;i++){
					data.grids[i] = []
					for(let j = 0;j < gridCounts[i];j++){
						data.grids[i].push(local.createGrid(uid,i))
					}
				}
				userDatas[uid] = data
				let info = {}
				for(let i in data){
					if(keysType[i] == "obj")
						info[i] = JSON.stringify(data[i])
					else
						info[i] = data[i]
				}
				self.setHMObj(uid,main_name,info)
			}else{
				for(let i in data){
					if(keysType[i] == "obj")
						data[i] = JSON.parse(data[i])
					else if(keysType[i] == "num")
						data[i] = Number(data[i])
					else
						data[i] = data[i]
				}
			}
			userDatas[uid] = data
		})
		next()
	}
	//移除逐鹿之战数据
	this.zhuluUnload = function(uid) {
		delete userDatas[uid]
	}
	//获取逐鹿之战数据
	this.getZhuluData = function(uid,cb) {
		cb(true,userDatas[uid])
	}
	//生成格子数据
	local.createGrid = function(uid,grid) {
		if(grid % 10 === 0){
			//boss
			let info = {type:"boss"}
			var team = boss_team[Math.floor(Math.random() * boss_team.length)].concat()
			team = self.standardTeam(uid,team,zhulu_cfg["boss_dl"]["value"])
			var dladd = zhulu_dl[grid]
			for(let i = 0;i <= team.length;i++){
				if(team[i]){
					self.fightContorl.mergeData(team[i],dladd)
				}
			}
			info.team = team
			return info
		}else{
			let rand = Math.random() * allWeight
			for(let type in weights){
				if(rand < weights[type]){
					let info = {type:type}
					switch(type){
						case "normal":
							//普通怪
							var team = normal_team[Math.floor(Math.random() * normal_team.length)].concat()
							team = self.standardTeam(uid,team,zhulu_cfg["normal_dl"]["value"])
							var dladd = zhulu_dl[grid]
							for(let i = 0;i <= team.length;i++){
								if(team[i]){
									self.fightContorl.mergeData(team[i],dladd)
								}
							}
							info.team = team
						break
						case "elite":
							//精英怪
							var team = elite_team[Math.floor(Math.random() * elite_team.length)].concat()
							team = self.standardTeam(uid,team,zhulu_cfg["elite_dl"]["value"])
							var dladd = zhulu_dl[grid]
							for(let i = 0;i <= team.length;i++){
								if(team[i]){
									self.fightContorl.mergeData(team[i],dladd)
								}
							}
							info.team = team
						break
						case "heal":
							//恢复
						break
						case "resurgence":
							//复活
						break
						case "shop":
							//商城
							info.list = local.createShop()
						break
					}
					return info
				}
			}
		}
	}
	//生成商城数据
	local.createShop = function() {
		var list = []
		for(let i = 0;i < 4;i++){
			let rand = Math.random() * shopAllWeight
			for(let j in shopWeights){
				if(rand < shopWeights[j].weight){
					list.push(shopWeights[j])
					break
				}
			}
		}
		return list
	}
	//生成战利品
	local.createSpoils = function(uid,type) {
		var spoils_list = []
		switch(type){
			case "boss":
				for(let i = 0;i < 3;i++){
					var spoils = Object.assign({},spoils_qualitys[5][Math.floor(Math.random() * spoils_qualitys[5].length)])
					spoils_list.push(spoils)
				}
			break
			case "elite":
				for(let i = 0;i < 3;i++){
					var spoils
					if(Math.random() < 0.7)
						spoils = Object.assign({},spoils_qualitys[3][Math.floor(Math.random() * spoils_qualitys[3].length)])
					else
						spoils = Object.assign({},spoils_qualitys[4][Math.floor(Math.random() * spoils_qualitys[4].length)])
					spoils_list.push(spoils)
				}
			break
			case "normal":
				for(let i = 0;i < 3;i++){
					var spoils = Object.assign({},spoils_qualitys[3][Math.floor(Math.random() * spoils_qualitys[3].length)])
					spoils_list.push(spoils)
				}
			break
		}
		return spoils_list
	}
	//选择格子
	this.chooseGrid = function(uid,choose,cb) {
		if(userDatas[uid].curChoose !== -1){
			cb(false,"curChoose != -1")
			return
		}
		// let oldGrid = userDatas[uid]["gridList"][userDatas[uid]["curGrid"] - 1]
		// if(oldGrid !== undefined){
		// 	let offset = userDatas[uid]["grids"][userDatas[uid]["curGrid"]].length == 2 ? -0.5 : 0.5
		// 	console.log(choose,offset,oldGrid,Math.abs(choose + offset - oldGrid))
		// 	if(userDatas[uid]["curGrid"] % 10 != 0 && Math.abs(choose + offset - oldGrid) > 1){
		// 		cb(false,"必须选择连续的路径")
		// 		return
		// 	}
		// }
		let grid = userDatas[uid]["curGrid"] + 1
		if(!Number.isInteger(choose) || !userDatas[uid]["grids"][grid] || !userDatas[uid]["grids"][grid][choose]){
			cb(false,"choose error "+choose)
			return
		}
		userDatas[uid]["gridList"][userDatas[uid]["curGrid"]] = choose
		local.changeData(uid,"curChoose",choose)
		local.changeData(uid,"gridList",userDatas[uid]["gridList"])
		cb(true)
	}
	local.spoilsLoad = function(atkTeam,spoils) {
		for(let i = 0;i <spoils.length;i++){
			let targetList = []
			switch(spoils[i].type){
				case "all":
					targetList = [0,1,2,3,4,5]
				break
				case "front":
					targetList = [0,1,2]
				break
				case "back":
					targetList = [3,4,5]
				break
				case "carry":
					for(let k = 0;k < atkTeam.length;k++){
						if(atkTeam[k] && (heros[atkTeam[k].id]["career"] == 1 || heros[atkTeam[k].id]["career"] == 2)){
							targetList.push(k)
						}
					}
				break
				case "support":
					for(let k = 0;k < atkTeam.length;k++){
						if(atkTeam[k] && heros[atkTeam[k].id]["career"] == 4){
							targetList.push(k)
						}
					}
				break
				case "tank":
					for(let k = 0;k < atkTeam.length;k++){
						if(atkTeam[k] && heros[atkTeam[k].id]["career"] == 3){
							targetList.push(k)
						}
					}
				break
				case "human":
					for(let k = 0;k < atkTeam.length;k++){
						if(atkTeam[k] && heros[atkTeam[k].id]["realm"] == 2){
							targetList.push(k)
						}
					}
				break
				case "celestial":
					for(let k = 0;k < atkTeam.length;k++){
						if(atkTeam[k] && heros[atkTeam[k].id]["realm"] == 1){
							targetList.push(k)
						}
					}
				break
				case "wizard":
					for(let k = 0;k < atkTeam.length;k++){
						if(atkTeam[k] && heros[atkTeam[k].id]["realm"] == 3){
							targetList.push(k)
						}
					}
				break
				case "orc":
					for(let k = 0;k < atkTeam.length;k++){
						if(atkTeam[k] && heros[atkTeam[k].id]["realm"] == 4){
							targetList.push(k)
						}
					}
				break
			}
			for(let j = 0;j < targetList.length;j++){
				if(atkTeam[targetList[j]]){
					if(!atkTeam[targetList[j]][spoils[i].spoils_type])
						atkTeam[targetList[j]][spoils[i].spoils_type] = spoils[i].value
					else
						atkTeam[targetList[j]][spoils[i].spoils_type] += spoils[i].value
				}
			}
		}
		return atkTeam
	}
	//获取逐鹿战斗数据
	this.getZhuluFightData = function(uid,cb) {
		self.heroDao.getZhuluTeam(self.areaId,uid,function(flag,atkTeam) {
			if(!flag){
				cb(flag,atkTeam)
			}else{
				userFightDatas[uid] = {}
				let grid = userDatas[uid]["curGrid"] + 1
				atkTeam = local.spoilsLoad(atkTeam,userDatas[uid]["spoils"])
		    	for(let i = 0;i<atkTeam.length;i++){
		    		if(atkTeam[i] && userDatas[uid]["surplus_healths"][atkTeam[i].hId] !== undefined)
		    			atkTeam[i].surplus_health = userDatas[uid]["surplus_healths"][atkTeam[i].hId]
		    	}
		    	userFightDatas[uid] = {seededNum : Date.now(),atkTeam : atkTeam}
			    cb(true,userFightDatas[uid])
			}
		})
	}
	//执行操作
	this.executeGrid = function(uid,arg,cb) {
		if(userDatas[uid].curChoose < 0){
			cb(false,"curChoose error "+userDatas[uid].curChoose)
			return
		}
		let grid = userDatas[uid]["curGrid"] + 1
		let choose = userDatas[uid].curChoose
		let type = userDatas[uid]["grids"][grid][choose].type
		switch(type){
			case "boss":
			case "elite":
			case "normal":
				if(!userFightDatas[uid]){
					cb(false,"未获取战斗数据")
					return
				}
				var atkTeam = userFightDatas[uid].atkTeam
				var seededNum = userFightDatas[uid].seededNum
				var defTeam = userDatas[uid]["grids"][grid][choose].team
				delete userFightDatas[uid]
			    var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
		    	var list = self.fightContorl.getFightRecord()
		    	let overInfo = list[list.length - 1]
		    	for(var i = 0;i<atkTeam.length;i++){
		    		if(atkTeam[i] && overInfo.atkTeam[i]){
		    			userDatas[uid]["surplus_healths"][atkTeam[i].hId] = overInfo.atkTeam[i].hp/overInfo.atkTeam[i].maxHP
		    			if(userDatas[uid]["surplus_healths"][atkTeam[i].hId] >= 1){
		    				delete userDatas[uid]["surplus_healths"][atkTeam[i].hId]
		    			}
		    		}
		    	}
		    	local.changeData(uid,"surplus_healths",userDatas[uid]["surplus_healths"])
		    	var info = {
		    		winFlag : winFlag,
		    		surplus_healths : userDatas[uid]["surplus_healths"]
		    	}
			    if(winFlag){
		    		info.spoils_list = local.createSpoils(uid,type)
		    		info.curChoose = -2
			    	local.changeData(uid,"spoils_list",info.spoils_list)
		    		local.changeData(uid,"curChoose",info.curChoose)
		    		info.awardList = self.addItemStr(uid,zhulu_award[grid]["award"])
			    }else{
			    	for(var i = 0;i<defTeam.length;i++){
			    		if(defTeam[i] && overInfo.defTeam[i]){
			    			userDatas[uid]["grids"][grid][choose].team[i].surplus_health = overInfo.defTeam[i].hp/overInfo.defTeam[i].maxHP
			    		}
			    	}
			    	info.defTeam = userDatas[uid]["grids"][grid][choose].team
			    	local.changeData(uid,"grids",userDatas[uid]["grids"])
			    }
			    cb(true,info)
			break
			case "heal":
				//恢复
				for(var i = 0;i < userDatas[uid].zhuluTeam.length;i++){
					if(userDatas[uid].zhuluTeam[i]){
						if(userDatas[uid]["surplus_healths"][userDatas[uid].zhuluTeam[i]] !== undefined){
							userDatas[uid]["surplus_healths"][userDatas[uid].zhuluTeam[i]] += 0.5
							if(userDatas[uid]["surplus_healths"][userDatas[uid].zhuluTeam[i]] >= 1){
								delete userDatas[uid]["surplus_healths"][userDatas[uid].zhuluTeam[i]]
							}
						}
					}
				}
				local.changeData(uid,"surplus_healths",userDatas[uid]["surplus_healths"])
				local.nextGrid(uid)
				cb(true,{surplus_healths : userDatas[uid]["surplus_healths"],curChoose : userDatas[uid]["curChoose"],curGrid : userDatas[uid]["curGrid"]})
			break
			case "resurgence":
				//复活
				var minHeal = 1
				var minHid = 0
				for(var i in userDatas[uid]["surplus_healths"]){
					if(!minHid || userDatas[uid]["surplus_healths"][i] < minHeal){
						minHid = i
						minHeal = userDatas[uid]["surplus_healths"][i]
					}
				}
				if(minHid){
					delete userDatas[uid]["surplus_healths"][minHid]
					local.changeData(uid,"surplus_healths",userDatas[uid]["surplus_healths"])
				}
				local.nextGrid(uid)
				cb(true,{minHid : minHid,curChoose : userDatas[uid]["curChoose"],curGrid : userDatas[uid]["curGrid"]})
			break
			case "shop":
				//商城
				var list = userDatas[uid]["grids"][grid][choose].list
				if(!Number.isInteger(arg) || !list[arg]){
					cb(false,"arg error"+arg)
					return
				}
				if(userDatas[uid]["sellOutList"][arg]){
					cb(false,"已售罄")
					return
				}
				self.consumeItems(uid,list[arg]["price"],1,function(flag,err) {
					if(!flag){
						cb(flag,err)
						return
					}
					userDatas[uid]["sellOutList"][arg] = 1
					local.changeData(uid,"sellOutList",userDatas[uid]["sellOutList"])
					var awardList = self.addItemStr(uid,list[arg]["goods"])
					cb(true,awardList)
				})
			break
			default:
				cb(false)
		}
	}
	//放弃格子
	this.giveupGrid = function(uid,cb) {
		if(userDatas[uid].curChoose < 0){
			cb(false,"curChoose error ")
			return
		}
		let grid = userDatas[uid]["curGrid"] + 1
		let choose = userDatas[uid].curChoose
		switch(userDatas[uid]["grids"][grid][choose].type){
			case "heal":
			case "resurgence":
			case "shop":
				local.nextGrid(uid)
				cb(true,{curChoose : userDatas[uid]["curChoose"],curGrid : userDatas[uid]["curGrid"]})
			break
			default:
				cb(false)
		}
	}
	//开启宝箱
	this.openZhuluBox = function(uid,cb) {
		if(userDatas[uid]["curChoose"] != -3){
			cb(false,"不在宝箱阶段")
			return
		}
		var bossLv = Math.ceil(userDatas[uid]["curGrid"] / 10)
		var boxId = "box"+bossLv
		var awardList = self.addItemStr(uid,zhulu_cfg[boxId]["value"])
		var lv = self.getLordLv(uid)
		var coinCount = lv * 200 * (1 + bossLv)
		var expCount = lv * 120 * (1 + bossLv)
		var str = "201:"+coinCount+"&101:"+expCount
		awardList = awardList.concat(self.addItemStr(uid,str))
		local.changeData(uid,"curChoose",-1)
		cb(true,{curChoose : userDatas[uid]["curChoose"],curGrid : userDatas[uid]["curGrid"],awardList : awardList})
	}
	//改变逐鹿上阵阵容
	this.setZhuluTeam = function(uid,hIds,cb) {
		this.heroDao.setZhuluTeam(self.areaId,uid,hIds,function(flag,data) {
			if(flag){
				local.changeData(uid,"zhuluTeam",hIds)
			}
			cb(flag,data)
		})
	}
	//选择战利品
	this.chooseSpoils = function(uid,index,cb) {
		if(userDatas[uid]["curChoose"] != -2){
			cb(false,"不在战利品阶段")
			return
		}
		if(userDatas[uid]["spoils_list"] && userDatas[uid]["spoils_list"][index]){
			var spoils = userDatas[uid]["spoils_list"][index]
			userDatas[uid]["spoils"].push(spoils)
			local.changeData(uid,"spoils",userDatas[uid]["spoils"])
			local.changeData(uid,"spoils_list",[])
			local.nextGrid(uid)
			cb(true,{curChoose : userDatas[uid]["curChoose"],curGrid : userDatas[uid]["curGrid"],spoils : spoils})
		}else{	
			cb(false,"index error")
		}
	}
	//进入下一个格子
	local.nextGrid = function(uid) {
		local.changeData(uid,"curGrid",userDatas[uid]["curGrid"]+1)
		local.changeData(uid,"sellOutList",{})
		if(userDatas[uid]["curGrid"]%10 == 0){
			local.changeData(uid,"curChoose",-3)
		}else{
			local.changeData(uid,"curChoose",-1)
		}
	}
	//改变数据
	local.changeData = function(uid,key,value) {
		if(userDatas[uid]){
			userDatas[uid][key] = value
		}
		if(keysType[key] == "obj")
			value = JSON.stringify(value)
		self.setObj(uid,main_name,key,value)
	}
}