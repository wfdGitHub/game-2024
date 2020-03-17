const zhulu_cfg = require("../../../../config/gameCfg/zhulu_cfg.json")
const zhulu_dl = require("../../../../config/gameCfg/zhulu_dl.json")
const zhulu_shop = require("../../../../config/gameCfg/zhulu_shop.json")
const zhulu_spoils = require("../../../../config/gameCfg/zhulu_spoils.json")
var util = require("../../../../util/util.js")
var main_name = "zhulu"
var allWeight = 0
var normal_team = JSON.parse(zhulu_cfg["normal_team"]["value"])
console.log(normal_team)
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
// console.log(weights,allWeight)
var shopAllWeight = 0
var shopWeights = {}
for(var i in zhulu_shop){
	shopWeights[i] = Object.assign({},zhulu_shop[i])
	shopAllWeight += shopWeights[i].weight
	shopWeights[i].weight = shopAllWeight
}
var gridCounts = [1,2,3,2,3,2,3,2,3,2,1,2,3,2,3,2,3,2,3,2,1,2,3,2,3,2,3,2,3,2,1]
// console.log(shopWeights,shopAllWeight)
//逐鹿之战
module.exports = function() {
	var self = this
	var userDatas = {}
	var local = {}
	//加载逐鹿之战数据
	this.zhuluLoad = function(uid,next) {
		self.getObjAll(uid,main_name,function(data) {
			if(!data || self.dayStr != data.dayStr){
				data = {
					dayStr : (new Date()).toDateString(),
					hierarchy : 0,
					curGrid : 0,
					curChoose : -1,
					surplus_healths : {},
					zhuluTeam : [],
					grids : {},
					spoils : [],
					chooseList : {}
				}
				console.log(data)
				let fightTeam = self.getUserTeam(uid)
				for(let i = 0;i < fightTeam.length;i++){
					if(fightTeam[i] && fightTeam[i].hId)
						data.zhuluTeam.push(fightTeam[i].hId)
					else
						data.zhuluTeam.push(null)
				}
				self.heroDao.setZhuluTeam(self.areaId,uid,data.zhuluTeam)
				for(let i = 1;i < gridCounts.length;i++){
					data.grids[i] = []
					for(let j = 0;j < gridCounts[i];j++){
						data.grids[i].push(local.createGrid(uid,i))
						console.log(data.grids[i][j])
					}
				}
				userDatas[uid] = data
				let info = {
					dayStr : data["dayStr"],
					hierarchy : data["hierarchy"],
					curGrid : data["curGrid"],
					curChoose : data["curChoose"]
				}
				info["surplus_healths"] = JSON.stringify(data["surplus_healths"])
				info["zhuluTeam"] = JSON.stringify(data["zhuluTeam"])
				info["grids"] = JSON.stringify(data["grids"])
				info["spoils"] = JSON.stringify(data["spoils"])
				info["chooseList"] = JSON.stringify(data["chooseList"])
				self.setHMObj(uid,main_name,info)
			}else{
				data["surplus_healths"] = JSON.parse(data["surplus_healths"])
				data["zhuluTeam"] = JSON.parse(data["zhuluTeam"])
				data["grids"] = JSON.parse(data["grids"])
				data["spoils"] = JSON.parse(data["spoils"])
				data["chooseList"] = JSON.parse(data["chooseList"])
				data["hierarchy"] = Number(data["hierarchy"])
				data["curGrid"] = Number(data["curGrid"])
				data["curChoose"] = Number(data["curChoose"])
			}
			userDatas[uid] = data
			console.log("userDatas[uid]",userDatas[uid])
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
			team = self.standardTeam(uid,team,3)
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
							team = self.standardTeam(uid,team,3)
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
							team = self.standardTeam(uid,team,3)
							var dladd = zhulu_dl[grid]
							dladd.self_maxHP_add += zhulu_cfg["elite_hp"]["value"]
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
		for(let i = 0;i < 3;i++){
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
	//获得战利品
	local.createSpoils = function() {
	}
	//选择格子
	this.chooseGrid = function(uid,choose,cb) {
		if(userDatas[uid].curChoose !== -1){
			cb(false,"已选择格子")
			return
		}
		let grid = userDatas[uid]["curGrid"] + 1
		if(!Number.isInteger(choose) || !userDatas[uid]["grids"][grid] || !userDatas[uid]["grids"][grid][choose]){
			cb(false,"choose error "+choose)
			return
		}
		userDatas[uid].curChoose = choose
		self.setObj(uid,main_name,"curChoose",choose)
		cb(true)
	}
	//执行操作
	this.executeGrid = function(uid,arg,cb) {
		if(userDatas[uid].curChoose == -1){
			cb(false,"未选择格子")
			return
		}
		let grid = userDatas[uid]["curGrid"] + 1
		let choose = userDatas[uid].curChoose
		console.log("grid",grid,choose,userDatas[uid]["grids"][grid][choose].type)
		switch(userDatas[uid]["grids"][grid][choose].type){
			case "boss":
			case "elite":
			case "normal":
				self.heroDao.getZhuluTeam(self.areaId,uid,function(flag,atkTeam) {
					if(!flag){
						cb(flag,atkTeam)
					}else{
						var defTeam = userDatas[uid]["grids"][grid][choose].team
						var seededNum = Date.now()
					    var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
					    // if(arg !== JSON.stringify(self.fightContorl.getFightRecord()[0])){
					    // 	cb(false,{"text":"战斗验证错误","fightRecord":self.fightContorl.getFightRecord()})
					    // 	return
					    // }
					    cb(true,winFlag)
					}
				})
			break
			default:
				cb(false)
		}
	}
	//放弃格子
	this.giveupGrid = function(uid,cb) {
		
	}
	//改变逐鹿上阵阵容
	this.setZhuluTeam = function(uid,hIds,cb) {
		
	}
	//选择战利品
	this.chooseSpoils = function(uid,index,cb) {
		
	}
	//进入下一个格子
	local.nextGrid = function(uid) {
		
	}
}