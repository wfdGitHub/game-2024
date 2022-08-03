//抽奖系统
const lotto_cfg = require("../../../../config/gameCfg/lotto_cfg.json")
const GM_CFG = require("../../../../config/gameCfg/GM_CFG.json")
const lottoMaps = {}
const allWeightMap = {}
const lottoRecords = {}
const MAX_GRID = 8
for(var i in lotto_cfg){
	lottoMaps[i] = require("../../../../config/gameCfg/"+lotto_cfg[i]["cfg"]+".json")
	lottoRecords[i] = []
	allWeightMap[i] = 0
	for(var j = 0;j < MAX_GRID;j++){
		lottoMaps[i][j]["weight"] += allWeightMap[i]
		allWeightMap[i] = lottoMaps[i][j]["weight"]
	}
}
const main_name = "lotto"
module.exports = function() {
	var self = this
	var local = {}
	//每日更新
	this.lottoDayUpdate = function(uid) {
		self.delObjAll(uid,main_name)
	}
	//获取抽奖数据
	this.getLottoData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			cb(true,data || {})
		})
	}
    //转盘免费抽奖
    this.lottoByFree = function(uid,type,cb) {
        if(!lotto_cfg[type] || !lotto_cfg[type]["free"]){
            cb(false,"type not find "+type)
            return
        }
        self.getObj(uid,main_name,type+"_free",function(data) {
        	data = Number(data) || 0
        	if(data && data >= lotto_cfg[type]["free"]){
        		cb(false,"免费次数已用完")
        		return
        	}
        	self.incrbyObj(uid,main_name,type+"_free",1)
        	local.onLotto(uid,type,1,cb)
        })
    }
    //转盘元宝抽奖
    this.lottoByGold = function(uid,type,count,cb) {
        if(!lotto_cfg[type] || !lotto_cfg[type]["count"]){
            cb(false,"type not find "+type)
            return
        }
        if(!lotto_cfg[type]["gold_"+count]){
        	cb(false,"该次数不能抽奖")
        	return
        }
        self.getObj(uid,main_name,type+"_count",function(data) {
        	data = Number(data) || 0
        	var gmLv = self.getLordAtt(uid,"gmLv")
        	if(data && (data + count) > (lotto_cfg[type]["count"] + GM_CFG[gmLv]["lotto"])){
        		cb(false,"抽奖次数不足")
        		return
        	}
			self.consumeItems(uid,lotto_cfg[type]["gold_"+count],1,"转盘"+type,function(flag,err) {
				if(!flag){
					cb(false,err)
				}else{
		        	self.incrbyObj(uid,main_name,type+"_count",count)
		        	local.onLotto(uid,type,count,cb)
				}
			})

        })
    }
    //转盘道具抽奖
    this.lottoByItem = function(uid,type,count,cb) {
        if(!lotto_cfg[type]){
            cb(false,"type not find "+type)
            return
        }
        if(!lotto_cfg[type]["pc"]){
        	cb(false,"不能道具抽奖")
        	return
        }
		self.consumeItems(uid,lotto_cfg[type]["pc"],count,"转盘"+type,function(flag,err) {
			if(!flag){
				cb(false,err)
			}else{
	        	local.onLotto(uid,type,count,cb)
			}
		})
    }
    //开始抽奖
    local.onLotto = function(uid,type,count,cb) {
		var name = self.players[uid]["name"]
		var awardList = []
		var index = -1
		for(var i = 0;i < count;i++){
			var rand = Math.random() * allWeightMap[type]
			for(var j = 0;j < MAX_GRID;j++){
				if(rand < lottoMaps[type][j]["weight"]){
					index = j
					awardList = awardList.concat(self.addItemStr(uid,lottoMaps[type][j]["award"],1,"转盘:"+type))
					if(lottoMaps[type][j]["rare"]){
						local.saveRecord(name,type,lottoMaps[type][j]["award"])
					}
					break
				}
			}
		}
		cb(true,{awardList:awardList,index:index})
    }
    //保存转盘稀有道具记录
    local.saveRecord = function(name,type,award) {
    	if(lottoRecords[type]){
			lottoRecords[type].push({name : name,award:award})
			if(lottoRecords[type].length > 5)
				lottoRecords[type].shift()
    	}
    }
    //获得转盘稀有道具记录
    this.getLottoRecord = function(type,cb) {
    	cb(true,lottoRecords[type])
    }
}