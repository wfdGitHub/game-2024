//BUFF作用基类
const DTIME = 1000
var model = function(fighting,character,buffCfg) {
	this.fighting = fighting
	this.list = []
	this.buffCfg = buffCfg
	this.id = buffCfg.id
	this.rate = buffCfg.rate || 0 				//概率
	this.time = buffCfg.time || 0 				//BUFF持续时间
	this.attacker = false
	this.character = character
	this.max_count = buffCfg["max_count"] || 1 	//最大层数

	//============伤害参数===============//
	this.d_type = buffCfg["d_type"] 			//结算类型
	this.d_time = DTIME 						//伤害刷新时间
	if(this.d_type == "mag" || this.d_type == "phy")
		this.domain = this.domain_damage
	else if(this.d_type == "heal")
		this.domain = this.domain_heal

	this.status = {} 							//控制状态
	this.control = false 						//是否为控制BUFF
	this.attKeys = {}
	this.attBuff = false
	for(var i = 1;i <= 3;i++){
		//属性
		if(buffCfg["attKey"+i]){
			this.attBuff = true
			this.attKey = buffCfg["attKey"+i]
			this.attKeys[buffCfg["attKey"+i]] = buffCfg["attValue"+i] || 0
		}
		//状态
		if(buffCfg["status"+i]){
			this.control = true
			this.status[buffCfg["status"+i]] = 1
		}
	}
	this.record = buffCfg["effects"] ? true : false
	this.init()
}
//BUFF初始化
model.prototype.init = function() {}
//新增一层BUFF
model.prototype.addBuff = function(attacker,buffCfg) {
	if(!buffCfg)
		return
	var changeFlag = false
	var count = buffCfg.count || 1
	for(var i = 0;i < count;i++){
		if(this.list.length < this.max_count){
			changeFlag = true
			this.attacker = attacker
			var info = {attacker:attacker,buff : buffCfg,time : buffCfg.time}
			if(this.d_type){
				info.value = 0
				if(buffCfg["atkRate"])
					info.value += Math.floor(buffCfg["atkRate"] * attacker.getTotalAtt("atk")) || 0
				if(buffCfg["hpRate"])
					info.value += Math.floor(buffCfg["hpRate"] * this.character.getTotalAtt("maxHP")) || 0
			}
			this.list.push(info)
		}
	}
	if(changeFlag)
		this.addRecord({type : "buffNum",id : this.character.id,bId : this.id,num:this.list.length})
}
//移除一层BUFF
model.prototype.delBuff = function() {
	this.list.shift()
	if(this.list.length <= 0)
		this.destroy()
}
//BUFF更新
model.prototype.update = function(dt) {
	this.d_time -= dt
	this.domain()
	var num = this.list.length
	for(var i = 0;i < this.list.length;i++){
		this.list[i].time -= dt
		if(this.list[i].time <= 0){
			this.list.splice(i,1)
			i--
		}
	}
	if(this.list.length <= 0){
		this.destroy()
	}else if(num != this.list.length){
		this.addRecord({type : "buffNum",id : this.character.id,bId : this.id,num:this.list.length})
	}
}
//BUFF消失
model.prototype.destroy = function() {
	this.addRecord({type : "buffDel",id : this.character.id,bId : this.id})
	this.character.removeBuff(this.id)
}
//获取Buff层数
model.prototype.getCount = function() {
	return this.list.length
}
//记录日志
model.prototype.addRecord = function(record) {
    this.fighting.nextRecord.push(record)
}
//=========================BUFF结算
//BUFF功能实现
model.prototype.domain = function() {}
//伤害BUFF
model.prototype.domain_damage = function() {
	if(this.d_time <= 0){
		this.d_time = DTIME
		for(var i = 0;i < this.list.length;i++)
			this.character.onOtherDamage(this.list[i].attacker,this.list[i].value)
	}
}
//治疗BUFF
model.prototype.domain_heal = function() {
	if(this.d_time <= 0){
		this.d_time = DTIME
		for(var i = 0;i < this.list.length;i++)
			this.character.onOtherHeal(this.list[i].attacker,this.list[i].value)
	}
}
//=========================BUFF效果
//获取加成属性
model.prototype.getAttInfo = function(name) {
	if(this.attKeys[name] !== undefined){
		var value = 0
		for(var i = 0;i < this.list.length;i++)
			value += this.attKeys[name] || 0
		return value
	}
	return 0
}
module.exports = model