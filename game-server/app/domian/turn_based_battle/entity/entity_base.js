//战斗角色基类
var model = function(otps,talentList) {
	//=========身份===========//
	otps = otps || {}
	talentList = talentList || []
	this.id = Number(otps.id)
	//基础属性
	this.curAnger = 50 					//初始怒气
	this.maxAnger = 100 				//最大怒气
	this.needAnger = 100  				//释放技能所需怒气
	//一级属性
	this.mainAtt = {}
	this.mainAtt.main_1 = 0 			//体质  影响伤免、最大生命值
	this.mainAtt.main_2 = 0 			//内力  影响内功伤害、内功减免
	this.mainAtt.main_3 = 0 			//筋骨  影响外功伤害、外功减免
	this.mainAtt.main_4 = 0 			//身法  影响出手速度、命中、闪避
	this.mainAtt.main_5 = 0 			//悟性  影响暴击伤害、格挡、破格
	//二级属性
	this.attInfo = {}
	this.attInfo.maxHP = 0 				//最大生命值
	this.attInfo.atk = 0 				//攻击力
	this.attInfo.armor = 0 				//护甲
	this.attInfo.speed = 0 				//速度
	//三级属性
	this.attInfo.hit = 0 				//命中率
	this.attInfo.hitDef = 0 			//闪避率
	this.attInfo.block = 0 				//格挡率
	this.attInfo.blockDef = 0 			//破格率
	this.attInfo.crit = 0 				//暴击率
	this.attInfo.critDef = 0 			//抗暴率
	this.attInfo.slay = 0 				//暴伤加成
	this.attInfo.slayDef = 0 			//暴伤减免
	//四级属性
	this.attInfo.control = 0 			//控制率
	this.attInfo.controlDef = 0 		//免控率
	this.attInfo.amp = 0 				//伤害加成
	this.attInfo.ampDef = 0 			//伤害减免
	this.attInfo.angerAmp = 0 			//技攻增伤
	this.attInfo.angerDef = 0 			//技攻减伤
	this.attInfo.healAmp = 0 			//治疗加成
	this.attInfo.healAdd = 0 			//受疗加成
	this.attInfo.phyAmp = 0 			//外功增伤
	this.attInfo.phyDef = 0 			//外功减伤
	this.attInfo.magAmp = 0 			//内功增伤
	this.attInfo.magDef = 0 			//内功减伤
	this.attInfo.magAmp = 0 			//内功增伤
	this.attInfo.magDef = 0 			//内功减伤
	this.attInfo.poisonAmp = 0 			//中毒增伤
	this.attInfo.poisonDef = 0 			//中毒减伤
}

//基础方法
model.prototype.say = function() {
	console.log("我是entity_base")
}


module.exports = model