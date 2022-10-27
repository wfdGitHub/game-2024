var fightRecord = require("../fight/fightRecord.js")
var buffManager = require("../buff/buffManager.js")
var baseSkill = require("./baseSkill.js")
//主角技能
var model = function(otps,character) {
	baseSkill.call(this,otps,character)
	this.type = otps.type
	this.skillType = "power"
	this.isAnger = true
	//初始化参数
	this.baseMUl = this.mul 							//技能初始威力
	this.NEED_BP = otps.NEED_BP || 10					//所需BP值
	this.NEED_CD = otps.NEED_CD || 10 					//技能所需CD
	this.CUR_CD = otps.CUR_CD || 0						//初始CD
	this.basic = otps.basic || 0 						//基础伤害加成
	this.tmpBuffRate = 0 								//临时BUFF概率
	//初始化方法
	this.initArg = function() {
		for(var i = 1;i <= 5;i++){
			if(this.otps["key"+i] && this.otps["value"+i] !== undefined){
				var key = this.otps["key"+i]
				var value = this.otps["value"+i]
				switch(key){
					case "buff1":
						this.addBuff(value)
					break
					case "buff2":
						this.addBuff(value)
					break
					case "buff3":
						this.addBuff(value)
					break
				}
				this[key] = value
			}
		}
		if(this.power_up)
			this.character.power_up += this.power_up
	}
	//使用技能结束
	this.useSkillOver = function() {
		//使用技能后改变BP
		if((this.NEED_BP + this.use_change_bp) >= 3  && (this.NEED_BP + this.use_change_bp) <= 12){
			this.NEED_BP += this.use_change_bp
		}
		if(this.enemy_cd_up && this.character.peerMaster){
			this.character.peerMaster.updateCD(this.enemy_cd_up)
		}
		if(this.enemy_bp_up && this.character.peerMaster)
			this.character.peerMaster.TMP_CURBP += this.enemy_bp_up
		if(this.use_un_bp)
			this.character.ONCE_CURBP = -1
		if(this.use_up_mul)
			this.mul += this.baseMUl * this.use_up_mul
	}
	//击杀目标后
	this.onKill = function() {
		if(this.power_kill_bp)
			this.character.changeBP(1)
	}
	//回合结束
	this.endRound = function() {
		this.updateCD(-1)
		//若未使用技能叠加BUFF命中率
		if(this.round_buff_rate)
			this.tmpBuffRate += this.round_buff_rate
	}
	//更新CD
	this.updateCD = function(value) {
		this.CUR_CD += value
		if(this.CUR_CD < 0)
			this.CUR_CD = 0
	}
	//获取显示数据
	this.getShowData = function() {
		var info = {
			NEED_BP : this.NEED_BP + this.character.TMP_CURBP +this.character.ONCE_CURBP,
			NEED_CD : this.NEED_CD,
			CUR_CD : this.CUR_CD
		}
		return info
	}
	//初始化完成
	this.initArg()
}
module.exports = model