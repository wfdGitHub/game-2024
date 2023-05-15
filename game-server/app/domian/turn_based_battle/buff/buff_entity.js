//BUFF作用基类
var model = function(fighting,character,buff,buffCfg) {
	this.fighting = fighting
	this.buffId = buff.buffId
	this.list = []
	this.character = character
	this.buffCfg = buffCfg
	this.max_count = buffCfg["max_count"] || 1 	//最大层数
	this.attKeys = {}
	for(var i = 1;i <= 3;i++){
		if(buff["attKey"+i]){
			this.attKey = buffCfg["attKey"+i]
			this.attKeys[buff["attKey"+i]] = buff["attValue"+i] || 0
		}else if(buffCfg["attKey"+i]){
			this.attKey = buffCfg["attKey"+i]
			this.attKeys[buffCfg["attKey"+i]] = buffCfg["attValue"+i] || 0
		}
	}
	this.record = buffCfg["icon"] || buffCfg["effects"] ? true : false
	this.init()
}
//BUFF初始化
model.prototype.init = function() {}
//新增一层BUFF
model.prototype.addBuff = function(attacker,buff) {
	if(!buff)
		return
	if(this.list.length < this.max_count){
		//控制技能已行动则增加一回合
		if(this.buffCfg.control && this.character.isAction)
			buff.duration += 1
		this.list.push({attacker:attacker,buff : buff,duration : buff.duration})
		this.buffOtps(attacker,this.list[this.list.length - 1])
		this.addRecord({type : "buffAdd",id : this.character.id,bId : this.buffId,num:this.list.length})
	}
}
//移除一层BUFF
model.prototype.delBuff = function() {
	this.list.shift()
	if(this.list.length <= 0)
		this.destroy()
}
//BUFF每回合更新
model.prototype.update = function() {
	this.domain()
	var num = this.list.length
	for(var i = 0;i < this.list.length;i++){
		this.list[i].duration--
		if(this.list[i].duration <= 0){
			this.list.splice(i,1)
			i--
		}
	}
	if(this.list.length <= 0){
		this.destroy()
	}else if(num != this.list.length){
		this.addRecord({type : "buffNum",id : this.character.id,bId : this.buffId,num:this.list.length})
	}
}
//BUFF消失
model.prototype.destroy = function() {
	this.addRecord({type : "buffDel",id : this.character.id,bId : this.buffId})
	this.character.removeBuff(this.buffId)
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
//新增BUFF后参数处理
model.prototype.buffOtps = function(attacker,buff) {}
//BUFF功能实现
model.prototype.domain = function() {}
//buff结算后
model.prototype.bufflLater = function() {}
//判断CD满足
model.prototype.enoughCD = function() {
	if(this.NEED_CD && this.CUR_CD <= 0){
		this.CUR_CD = this.NEED_CD
		return true
	}
	return false
}
//判断次数满足
model.prototype.enoughCount = function() {
	if(this.MAX_NUM && this.CUR_NUM < this.MAX_NUM){
		this.CUR_NUM++
		return true
	}
	return false
}
//获取加成属性
model.prototype.getAttInfo = function(name) {
	if(this.attKeys[name] !== undefined){
		var value = 0
		for(var i = 0;i < this.list.length;i++){
			value += this.attKeys[name]
			value += this.list[i].num
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