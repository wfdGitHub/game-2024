//远征玩法
var main_name = "conquer"
module.exports = function() {
	var self = this
	var local = {}
	const conquerInfo = {
		"curL" : 0,					//当前关卡等级
		"level" : 0,				//难度等级
		"reset" : 0,				//重置状态  0未重置 大于0 已重置
		"state" : 0,				//游戏状态  0 未选择级别 1 可挑战 2 选择加成奖励 3 已失败
		"team" : "{}",				//当前队伍状态
		"attAward" : "[]",			//奖励内容
	}
	//获取远征数据
	this.getConquerInfo = function(uid,cb) {
		self.getObjAll(uid,main_name,function(obj) {
			var info = Object.assign({},conquerInfo,obj)
			info.curL = parseInt(info.curL)
			info.reset = parseInt(info.reset)
			info.team = JSON.parse(info.team)
			info.seededNum = parseInt(info.seededNum)
			cb(info)
		})
	}
	//玩家首次登陆刷新
	this.conquerDayUpdate = function(uid) {
		self.setObj(uid,main_name,"reset",0)
	}
	//重置
	this.conquerReset = function(uid,cb) {
		self.incrbyObj(uid,main_name,"reset",1,function(data) {
			if(data == 1){
				self.setObj(uid,main_name,"curL",0)
				self.setObj(uid,main_name,"state",0)
			}else{
				cb(false,"次数已用完")
			}
		})
	}
	//选择级别
	this.conquerChooseLevel = function(uid,level,cb) {
	    var fightInfo = self.getFightInfo(uid)
	    if(!fightInfo){
	    	cb(false,"atkTeam error")
	    	return
	    }
		self.getObj(uid,main_name,"state",function(state) {
			if(state == 0){
				var info = {
					"curL" : 0,
					"level" : level,
					"state" : 1
				}
				info.team = JSON.stringify(fightInfo.team)
				info.seededNum = fightInfo.seededNum
				self.setHMObj(uid,main_name,info)
				cb(true,info)
			}else{
				cb(false,"已选择难度等级,请先重置")
			}
		})
	}
	//挑战关卡
	this.conquerChallenge = function(uid,grade,otps,cb) {
		// self.getConquerInfo(uid,function(userInfo) {
		// 	var level = userInfo.level
		// 	var curL = userInfo.curL
		// 	var atkTeam = userInfo.team
		// 	var defTeam = []
		// 	var seededNum = userInfo.seededNum
		// 	var result = self.fightContorl.fighting(atkTeam,defTeam,seededNum,otps.readList)
		// 	if(result.verify === otps.verify){
		// 		var info = {}
		// 		if(result.result === "win"){
		// 			//胜利
		// 			info.state = 2
		// 			//宝箱奖励

		// 			//能力加成

		// 		}else{
		// 			//失败
		// 			info.state = 3
		// 			cb(true)
		// 		}
		// 		self.setHMObj(uid,main_name,info)
		// 		cb(true,info)
		// 	}else{
		//     	console.error(otps.verify,result.verify)
		//     	cb(false,result.verify)
		//     }
		// })
	}
	//生成属性加成列表
	local.createAttList = function(index,cb) {
		
	}
	//选择属性加成
	this.conquerChooseAtt = function(uid,index,cb) {

	}
	//开启宝箱
	this.openBox = function(uid,boxId,cb) {

	}
}