//藏宝图
const cangbaotu = require("../../../../config/gameCfg/cangbaotu.json")
const util = require("../../../../util/util.js")
var model = function() {
	var self = this
	var local = {}
	//使用藏宝图
	this.useCangbaotu = function(uid,id,cb) {
		if(!cangbaotu[id] || !cangbaotu[id]["pc"]){
			cb(false,"id error "+id)
			return
		}
		self.consumeItems(uid,cangbaotu[id]["pc"],1,"藏宝图",function(flag,err) {
			if(!flag){
				cb(flag,err)
				return
			}
			var award = ""
			var info = {}
			info.list1 = local.createSlot(id)
			info.index1 = Math.floor(Math.random() * info.list1.length)
			award = info.list1[info.index1]
			if(award == "up"){
				//升级
				info.list2 = local.createSlot(id+"_up")
				info.index2 = Math.floor(Math.random() * info.list2.length)
				award = info.list2[info.index2]
				var awards = []
				switch(award){
					case "take_2":
						//随机两个
						var tmps = util.getRandomArray(info.list2,5)
						for(var i = 0;i < tmps.length && awards.length < 2;i++){
							if(tmps[i] != "take_2" && tmps[i] != "take_half" && tmps[i] != "take_all"){
								awards.push(tmps[i])
							}
						}
					break
					case "take_half":
						//拿走一半
						if(info.index2 == 0)
							var tmps = [1,2,3,9,10,11]
						else
							var tmps = [3,4,5,7,8,9]
						for(var i = 0;i < tmps.length;i++)
							if(info.list2[tmps[i]] != "take_2" && info.list2[tmps[i]] != "take_half" && info.list2[tmps[i]] != "take_all")
								awards.push(info.list2[tmps[i]])
					break
					case "take_all":
						//拿走全部
						for(var i = 0;i < info.list2.length;i++)
							if(info.list2[i] != "take_2" && info.list2[i] != "take_half" && info.list2[i] != "take_all")
								awards.push(info.list2[i])
					break
					default:
						awards = [award]
				}
				info.awardList = []
				for(var i = 0;i < awards.length;i++)
					info.awardList = info.awardList.concat(self.addItemStr(uid,awards[i],1,"藏宝图"))
			}else{
				info.awardList = self.addItemStr(uid,award,1,"藏宝图")
			}
			cb(true,info)
		})
	}
	//生成格子
	local.createSlot = function(id) {
		var list = []
		for(var i = 0;i < 12;i++){
			var slot = util.getWeightedRandomBySort(cangbaotu[id]["weights"])
			list.push(util.getRandomOne(cangbaotu[id]["item"+slot]))
		}
		if(cangbaotu[id]["pc"]){
			if(Math.random() < cangbaotu["cfg"]["up"]){
				//概率升级
				var slot = util.getRandomOne(cangbaotu["cfg"]["up_slot"])
				list[slot] = "up"
			}
		}else{
			//一石二鸟	合纵连横	盆满钵满
			if(Math.random() < cangbaotu["cfg"]["take_2"]){
				//概率升级
				var slot = util.getRandomOne(cangbaotu["cfg"]["take_2_slot"])
				list[slot] = "take_2"
			}
			if(Math.random() < cangbaotu["cfg"]["take_half"]){
				//概率升级
				var slot = util.getRandomOne(cangbaotu["cfg"]["take_half_slot"])
				list[slot] = "take_half"
			}
			if(Math.random() < cangbaotu["cfg"]["take_all"]){
				//概率升级
				var slot = util.getRandomOne(cangbaotu["cfg"]["take_all_slot"])
				list[slot] = "take_all"
			}
		}
		return list
	}
}
module.exports = model