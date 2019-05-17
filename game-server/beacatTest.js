var bearcat = require("bearcat")
var contextPath = require.resolve('./context.json');
bearcat.createApp([contextPath])
bearcat.start(function() {})
var hero = {
	name : "英雄",	//名称
	maxHP : 100,	//最大血量
	atk : 10,		//攻击力
	def : 1,		//防御力
	atkSpeed : 1.7  //攻速 每几秒攻击一次
}
var mob = {
	name : "怪物",	//名称
	maxHP : 100,	//最大血量
	atk : 10,		//攻击力
	def : 1,		//防御力
	atkSpeed : 1.7  //攻速 每几秒攻击一次
}
var fightContorl = bearcat.getBean("fightContorl")
fightContorl.fighting([hero],[mob])