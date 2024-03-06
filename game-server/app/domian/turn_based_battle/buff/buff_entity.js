//BUFF作用基类
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
	this.status = {}
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
		if(buffCfg["status"+i])
			this.status[buffCfg["status"+i]] = 1
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
			this.list.push({attacker:attacker,buff : buffCfg,time : buffCfg.time})
			if(buffCfg.num){
				this.MAX_NUM = buffCfg.num
				this.CUR_NUM = 0
			}
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
//BUFF每回合更新
model.prototype.update = function(dt) {
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
	this.bufflLater()
}
//获取Buff层数
model.prototype.getCount = function() {
	return this.list.length
}
//记录日志
model.prototype.addRecord = function(record) {
    this.fighting.nextRecord.push(record)
}
//=========================BUFF效果
//BUFF功能实现
model.prototype.domain = function() {}
//buff结算后
model.prototype.bufflLater = function() {}
//获取加成属性
model.prototype.getAttInfo = function(name) {
	if(this.attKeys[name] !== undefined){
		var value = 0
		for(var i = 0;i < this.list.length;i++){
			value += this.attKeys[name] || 0
			value += this.list[i].num || 0
		}
		return value
	}
	return 0
}
//获取默认BUFF系数
model.prototype.getBuffMul = function() {
	var value = 0
	for(var i = 0;i < this.list.length;i++)
		value += Number(this.list[0].buff.mul) || 0
	return value
}
//获取value
model.prototype.getBuffValue = function() {
	var value = 0
	for(var i = 0;i < this.list.length;i++)
		value += Number(this.list[0].buff.value) || 0
	return value
}
module.exports = model