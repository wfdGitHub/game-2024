var bearcat = require("bearcat")
var contextPath = require.resolve('./context.json');
bearcat.createApp([contextPath])
bearcat.start(function() {})
var hero = [{
	name : "游侠",	//名称
	maxHP : 90,	//最大血量
	atk : 8,		//攻击力
	def : 0,		//防御力
	atkSpeed : 0.45 //攻速 每几秒攻击一次
},{
	name : "战士",	//名称
	maxHP : 300,	//最大血量
	atk : 20,		//攻击力
	def : 2,		//防御力
	atkSpeed : 3    //攻速 每几秒攻击一次
},{
	name : "法师",	//名称
	maxHP : 80,		//最大血量
	atk : 30,		//攻击力
	def : 0,		//防御力
	atkSpeed : 1  	//攻速 每几秒攻击一次
}]
var mob = [{
	name : "BOSS",	//名称
	maxHP : 1000,	//最大血量
	atk : 50,		//攻击力
	def : 1,		//防御力
	atkSpeed : 1.7  //攻速 每几秒攻击一次
},{
	name : "小怪A",	//名称
	maxHP : 100,	//最大血量
	atk : 18,		//攻击力
	def : 0,		//防御力
	atkSpeed : 3  	//攻速 每几秒攻击一次
},{
	name : "小怪B",	//名称
	maxHP : 100,	//最大血量
	atk : 18,		//攻击力
	def : 0,		//防御力
	atkSpeed : 3  	//攻速 每几秒攻击一次
}]
var fightContorl = bearcat.getBean("fightContorl")
fightContorl.fighting(hero,mob)