var skillManager = require("../skill/skillManager.js")
var passive = require("../skill/passive.js")
var fightRecord = require("../fight/fightRecord.js")
var buffManager = require("../buff/buffManager.js")
var buff_cfg = require("../../../../config/gameCfg/buff_cfg.json")
var passive_cfg = require("../../../../config/gameCfg/passive_cfg.json")
var model = function(otps) {
	//=========身份===========//
	this.heroId = Number(otps.id)
	this.characterType = "hero"  //角色类型
	this.realm = 1		//国家
	this.career = 1	//角色职业   healer 治疗者
	this.species = []
	if(otps.specie1)
		this.species.push(otps.specie1)
	if(otps.specie2)
		this.species.push(otps.specie2)
	this.otps = otps
	this.sex = 1 		//性别 1男 2女
	this.belong = ""   			//所属阵容
	this.index = 0				//所在位置
	this.isNaN = false			//是否空位置
	this.team = []				//所在阵容
	this.enemy = []				//敌对阵容
	this.lv = otps["lv"] || 1		//等级
	this.star = otps["star"] || 1		//星级
	this.ad = otps["ad"] || 0			//阶级
	this.teamInfo = {}
	this.heroAtts = otps.heroAtts
	this.isBoss = otps.boss || false	//是否是BOSS
	this.isAction = false 				//行动过标识
	this.onAction = false  				//行动中标识
	this.master = false 				//所属主角
	this.comeon = false 				//出场标识
	//=========基础属性=======//
	this.attInfo = {}
	this.attInfo.M_HP = otps["M_HP"] || 1
	this.attInfo.M_ATK = otps["M_ATK"] || 1
	this.attInfo.M_DEF = otps["M_DEF"] || 1
	this.attInfo.M_STK = otps["M_STK"] || 1
	this.attInfo.M_SEF = otps["M_SEF"] || 1
	this.attInfo.M_SPE = otps["M_SPE"] || 1
	this.attInfo.maxHP = otps["maxHP"] || 0				//最大生命值
	this.attInfo.atk = otps["atk"] || 0					//攻击力
	this.attInfo.phyDef = otps["phyDef"] || 0			//物理防御力
	this.attInfo.magDef = otps["magDef"] || 0			//法术防御力
	this.attInfo.crit = otps["crit"] || 0				//暴击几率
	this.attInfo.critDef = otps["critDef"] || 0			//抗暴几率
	this.attInfo.slay = otps["slay"] || 0				//爆伤加成
	this.attInfo.slayDef = otps["slayDef"] || 0			//爆伤减免
	this.attInfo.hitRate = otps["hitRate"] || 0			//命中率
	this.attInfo.dodgeRate = otps["dodgeRate"] || 0		//闪避率				
	this.attInfo.amplify = otps["amplify"] || 0			//伤害加深
	this.attInfo.reduction = otps["reduction"] || 0		//伤害减免
	this.attInfo.healRate = otps["healRate"] || 0		//治疗暴击几率
	this.attInfo.healAdd = otps["healAdd"] || 0			//被治疗加成
	this.attInfo.speed = (otps["speed"] || 0) + 100 	//速度值
	this.attInfo.speed += Math.floor((this.attInfo.speed * (this.attInfo.M_SPE-40) / (this.attInfo.M_SPE+120)))
	this.attInfo.hp = this.attInfo.maxHP				//当前生命值
	this.surplus_health = otps.surplus_health			//剩余生命值比例

	this.needAnger = otps["needAnger"] || 4				//技能所需怒气值
	this.curAnger = (otps["curAnger"] || 0) + 2			//当前怒气值
	this.allAnger = otps["allAnger"] || false   		//技能消耗所有怒气
	this.anyAnger = otps["anyAnger"] || false   		//当前怒气小于4点时，也能施放技能，技能伤害降低15%*(4-当前怒气值)
	this.totalDamage = 0								//累计伤害
	this.totalHeal = 0									//累计治疗

	this.first_buff_list = []			//初始BUFF
	this.kill_buffs = {} 				//击杀BUFF
	this.action_buffs = {} 				//行动后buff
	this.round_buffs = [] 				//回合开始前BUFF
	this.died_buffs = {} 				//死亡时buff
	this.passives = {} 					//被动技能
	//==========闪光阶级========//
	this.specie_behit = otps.specie_behit 						//对战中，对自身造成的克制伤害*0.75
	this.full_hp_red = otps.full_hp_red 						//HP全满的时候，受到的伤害减为原来1/2
	this.full_hp_save = otps.full_hp_save 						//HP全满时，受到一次攻击时，至少保留1点HP。
	this.specie_immune = otps.specie_immune 					//受该属性伤害降低90%
	this.listen_enemyBuff = otps.listen_enemyBuff 				//监听敌方获得BUFF
	this.listen_teamBuff = otps.listen_teamBuff 				//监听我方获得BUFF
	if(otps.listen_addBuff)
		this.listen_addBuff = JSON.parse(otps.listen_addBuff)  	//监听后自身获得BUFF
	this.polang_buff = otps.polang_buff 						//破浪叠满20层
	this.less_hp_rate = otps.less_hp_rate 						//生命值降低到一定程度触发BUFF
	this.less_hp_buff = otps.less_hp_buff 						//生命值降低到一定程度触发BUFF
	if(otps.passive1 && passive_cfg[otps.passive1])
		this.passives[otps.passive1] = new passive(this,passive_cfg[otps.passive1],otps.passiveArg1)
	if(otps.passive2 && passive_cfg[otps.passive2])
		this.passives[otps.passive2] = new passive(this,passive_cfg[otps.passive2],otps.passiveArg2)
	if(otps.passive3 && passive_cfg[otps.passive3])
		this.passives[otps.passive3] = new passive(this,passive_cfg[otps.passive3],otps.passiveArg3)
	//==========MEGA属性========//
	this.frozen_anger = otps.frozen_anger 				//冰冻后恢复怒气值
	this.enter_skill = otps.enter_skill 				//入场后释放怒气技能
	this.fanzhi_damage = otps.fanzhi_damage  			//每消耗1层反制印记，额外造成目标最大生命值的伤害
	if(otps.begin_round_buffs)
		this.begin_round_buffs = JSON.parse(otps.begin_round_buffs)  //回合开始时获得随机BUFF
	this.rescue_anger = otps.rescue_anger  				//复活恢复怒气值
	this.ghost_unlimit = otps.ghost_unlimit 			//亡魂无限制
	this.dodgeFirst = otps.dodgeFirst  					//闪避每回合第一次攻击
	this.dodgeState = false
	this.gj_my = otps.gj_my || false 					//进攻时免疫所有伤害
	this.bm_fz = otps.bm_fz || false 					//首次受到致命伤害时保留1点血量，使自身进入放逐状态，持续3回合
	//=========新战斗属性=======//
	this.tmpAmp = 0 										//临时伤害加成
	this.recover_settle = otps.recover_settle || false 		//释放持续恢复效果时，若目标身上已存在治疗效果，则立即结算原效果剩余回合数
	this.buffDuration = otps.buffDuration || 0 				//buff回合数增加
	this.remove_one_lower= otps.remove_one_lower || false   //行动前移除一个减益效果
	this.cold_hit_anger = otps.cold_hit_anger || 0 			//被寒冷状态下的敌人攻击时恢复怒气
	this.skill_again = otps.skill_again || 0 				//释放技能后再次释放概率
	this.add_anger_maxHp = otps.add_anger_maxHp || 0 		//追加技能伤害加成
	if(otps.died_once_buff)
		this.died_once_buff = JSON.parse(otps.died_once_buff) //死亡后触发buff,仅生效1
	this.thawing_frozen = otps.thawing_frozen || 0 			//破冰一击伤害加成
	this.thawing_burn = otps.thawing_burn || 0 				//水龙冲击伤害加成
	this.polang_heal = otps.polang_heal || 0 				//破浪每层回血
	this.polang_power = otps.polang_power || 0 				//破浪每层最大生命值伤害
	this.skill_anger_maxAtk = otps.skill_anger_maxAtk || 0 
	this.seckill = otps.seckill || false 					//释放技能时生命值低时秒杀

	this.skill_bleed_maxHp = otps.skill_bleed_maxHp 		//释放技能时，目标身上每有1层流血效果，额外造成最大生命值的伤害
	this.heat_halo_burn = otps.heat_halo_burn 				//炙热光环生效时对目标附加灼烧状态
	this.heat_halo_less = otps.heat_halo_less   			//炙热光环每次造成伤害时降低目标1点怒气
	this.skill_bleed_zs = otps.skill_bleed_zs  				//释放技能时，若目标身上的流血效果在5层及以上，则使其重伤，持续1回合。
	this.bleed_amp = otps.bleed_amp 						//对流血状态的目标造成伤害增加
	this.thawing_burn_hudun = otps.thawing_burn_hudun 		//释放水龙冲击后，为自身添加护盾，吸收最大生命值百分比的伤害，持续1回合
	this.thawing_burn_anger = otps.thawing_burn_anger 		//水龙冲击每命中一个目标，恢复自身怒气值
	this.sand_low_hit = otps.sand_low_hit 					//沙尘暴状态下的目标命中率降低
	this.sand_low_damage = otps.sand_low_damage 			//沙尘暴状态下的目标攻击力降低

	this.normal_combo = otps.normal_combo || 0 				//普攻连击概率
	this.skill_combo = otps.skill_combo || 0 				//技能连击，仅1次
	this.behit_heal = otps.behit_heal || 0 					//受到攻击后恢复最大生命值
	this.pojia_amp = otps.pojia_amp || 0 					//破甲伤害加成
	this.round_heal_type = otps.round_heal_type || 0 		//行动后，恢复目标类型
	this.round_heal_value = otps.round_heal_value || 0 		//行动后，恢复攻击力百分比的生命值
	this.cleanDebuff = otps.cleanDebuff || false 			//释放技能后，驱散负面状态
	this.rescue_realm_heal = otps.rescue_realm_heal || 0 	//复活同阵营英雄时生命值加成
	this.shanbi_fanzhi = otps.shanbi_fanzhi || false 		//闪避时获得闪避印记
	this.fanzhi_to_zs = otps.fanzhi_to_zs || false 			//释放技能时，若反制印记在3层以上时，对目标添加重伤效果
	this.flash_settle = otps.flash_settle || false 			//技能立即结算感电
	this.curse_settle = otps.curse_settle || false 			//技能立即结算诅咒
	this.flash_died_settle = otps.flash_died_settle || false //死亡时立即结算所有敌人感电
	this.died_heal_team = otps.died_heal_team || 0 			//死亡时恢复全体生命值，仅生效1次
	this.skill_dispel_enemy = otps.skill_dispel_enemy || false //释放技能后驱散目标1个增益效果
	this.cleanDebuff_anger = otps.cleanDebuff_anger || 0 		//释放技能每净化一个减益效果，增加怒气值
	this.died_rescue_team = otps.died_rescue_team || 0 		//阵亡后复活全体已阵亡友军，恢复百分比最大生命值，每场战斗仅生效1次
	this.soul_steal_anger = otps.soul_steal_anger || false  //灵魂窃取的目标怒气值转移至自身
	this.ghost_atk_heal = otps.ghost_atk_heal || 0 			//受到亡魂状态的敌人攻击后恢复自身最大生命值

	if(otps.first_realm_buff)
		this.first_realm_buff = JSON.parse(otps.first_realm_buff)
	this.slcj_zs = otps.slcj_zs || false  					// 释放水龙冲击时，添加1回合重伤效果
	this.slcj_xy = otps.slcj_xy || false 					// 释放水龙冲击时，添加1回合眩晕效果
	this.pbyj_qs = otps.pbyj_qs || false  					// 释放破冰一击时，驱散目标所有增益效果
	this.pj_less_anger = otps.pj_less_anger || 0 			// 使用技能攻击时，降低破甲状态下的目标一点怒气值
	this.curse_amp = otps.curse_amp || 0 					// 诅咒伤害增加百分比
	this.gd_mb = otps.gd_mb || false 						// 攻击触发感电效果时，有概率麻痹目标，持续1回合
	this.xr_zs = otps.xr_zs || false 						// 攻击虚弱状态下的英雄时，有概率添加重伤，持续1回合
	this.clean_team = otps.clean_team || false 				//行动后解除我方全体1个减益效果
	this.normal_add_skill = otps.normal_add_skill || 0 		//普攻后追加技能概率
	this.wh_anger = otps.wh_anger || 0 						//释放技能转化亡魂后恢复怒气
	this.my_intensify_amp = otps.my_intensify_amp 			//自身每有1个增益效果，造成的伤害增加
	this.enemy_low_amp = otps.enemy_low_amp 				//目标每有一个负面状态伤害加成
	this.ghost_amp = otps.ghost_amp || 0 					//亡魂状态增伤
	this.kill_ghost_dur = otps.kill_ghost_dur 				//每击杀一个目标亡魂持续回合数+1
	this.kill_ghost_value = 0 								//亡魂叠加回合数

	this.curAnger = (otps["curAnger"] || 0) + 2	//当前怒气值
	this.allAnger = otps["allAnger"] || false   //技能消耗所有怒气
	this.anyAnger = otps["anyAnger"] || false   //当前怒气小于4点时，也能施放技能，技能伤害降低15%*(4-当前怒气值)
	this.totalDamage = 0						//累计伤害
	this.totalHeal = 0							//累计治疗
	//=========阵营抗性=======//
	this.att_realm_1 = otps.att_realm_1 || 0 	//攻击阵营1增益
	this.att_realm_2 = otps.att_realm_2 || 0 	//攻击阵营2增益
	this.att_realm_3 = otps.att_realm_3 || 0 	//攻击阵营3增益
	this.att_realm_4 = otps.att_realm_4 || 0 	//攻击阵营4增益
	this.att_realm_5 = otps.att_realm_5 || 0 	//攻击阵营5增益
	this.def_realm_1 = otps.def_realm_1 || 0 	//防御阵营1增益
	this.def_realm_2 = otps.def_realm_2 || 0 	//防御阵营2增益
	this.def_realm_3 = otps.def_realm_3 || 0 	//防御阵营3增益
	this.def_realm_4 = otps.def_realm_4 || 0 	//防御阵营4增益
	this.def_realm_5 = otps.def_realm_5 || 0 	//防御阵营5增益
	
	//=========其他效果=======//
	this.kill_shield = otps.kill_shield || 0 				//直接伤害击杀敌方英雄后，为自身添加伤害吸收盾值
	this.skill_heal_maxHp = otps.skill_heal_maxHp || 0		//释放技能后恢复自身最大生命值
	//=========战法效果=======//
	this.zf_amp = 0 										//战法伤害加成
	this.less_anger_skip = otps.less_anger_skip ||  false 	//行动前，如果自己怒气小于4点,则会跳过行动，并使自身怒气增加4点
	this.recover_anger = otps.recover_anger || 0 			//自身添加的持续治疗效果生效时，使自身怒气增加1点的概率
	this.friend_died_amp = otps.friend_died_amp || 0		//己方每死亡一名英雄，自身伤害增加比例
	this.friend_died_count = otps.friend_died_count || 0	//己方每死亡一名英雄，自身伤害增加次数
	this.last_strategy = otps.last_strategy || false 		//死亡后，自身剩余怒气会转移给怒气最少的友方英雄
	this.round_same_hit_red = otps.round_same_hit_red || 0  //回合内受到同一敌方英雄攻击时，每受到一次伤害，伤害降低值
	this.round_same_value = {}								//回合内重复受到同一英雄攻击次数
	this.enemy_debuff_amp = otps.enemy_debuff_amp || 0 		//对处于异常状态的英雄造成的直接伤害加成
	this.my_debuff_red = otps.my_debuff_red || 0 			//自身处于异常状态时，免伤增加
	this.single_skill_heal = otps.single_skill_heal || 0 	//受到单体技能伤害时回血
	if(otps.no_ation_buff)
		this.no_ation_buff = JSON.parse(otps.no_ation_buff) || false 	//未行动对自身释放BUFF
	this.loss_hp_debuff = otps.loss_hp_debuff || 0 		//当自身被添加负面状态和控制效果时，会失去一定比例最大生命值，并免疫此效果。自身生命小于该比例时不会触发
	this.less_half_hp_heal = otps.less_half_hp_heal || 0 //全局回合结束时 生命值小于50%恢复自身生命
	if(otps.more_half_hp_buff)
		this.more_half_hp_buff = JSON.parse(otps.more_half_hp_buff) || false  //全局回合结束时 生命值大于50%释放BUFF
	this.half_hp_immune = otps.half_hp_immune || false  					//当自身生命值降低到50%以下时，立即清除自己异常状态，并对自身释放无敌盾，持续一回合，每场战斗最多生效一次
	this.half_hp_shild = otps.half_hp_shild || 0 				//当自身受到直接伤害使生命值降低到50%以下时，为自己附加伤害吸收盾，每回合可触发一次
	this.half_hp_shild_flag = true
	this.skill_clear_debuff = otps.skill_clear_debuff || false  //释放技能后，会清除己方生命最低的1名英雄的非控制类异常状态
	this.phy_turn_team_anger = otps.phy_turn_team_anger || 0 	//受到直接物理伤害时己方全体怒气提升1点，每回合最多触发次数
	this.phy_turn_value = 0 									//本回合已触发次数
	this.man_damage_red = otps.man_damage_red || 0 				//受到男性英雄直接伤害时，伤害降低率
	this.women_damage_anger = otps.women_damage_anger || 0  	//受到女性英雄直接伤害时，怒气增加
	this.chase_shield = otps.chase_shield || 0 					//追加普攻或技能时，会使自身增加生命值一定比例的伤害吸收盾，可叠加
	this.damage_always_burn = otps.damage_always_burn || false  //对敌方造成直接伤害时，始终视目标为灼烧状态
	this.poison_clean_damage = otps.poison_clean_damage || 0 	//对敌方造成的中毒状态结算或被清除时，对其造成最大生命值的伤害
	this.heal_same_shild = otps.heal_same_shild || 0 			//释放治疗技能后，若目标英雄与自身同阵营，则为其添加伤害吸收盾
	this.realm_action_amp = otps.realm_action_amp || 0 			//本回合中，己方其他同阵营英雄行动后，自身伤害提升比例，最多叠加4次
	this.first_beSkill_red = otps.first_beSkill_red || 0 		//每回合受到的第一次技能伤害降低比例
	this.first_beSkill_flag = true 							
	this.shield_red = otps.shield_red || 0 						//自身拥有伤害吸收盾时，受到的伤害降低
	this.damage_firend_shild = otps.damage_firend_shild || 0    //受到直接伤害时，伤害比例转化为伤害吸收盾附加给己方生命值最少的英雄
	this.onHit_extra_action = otps.onHit_extra_action || 0 		//受到伤害时额外行动概率
	this.onHit_extra_flag = true
	this.action_extra_action = otps.action_extra_action || 0    //行动后额外行动概率
	this.action_extra_flag = true 
	this.begin_realm_crit = otps.begin_realm_crit || 0 			//战斗开始前，己方全体暴击概率提升(值*己方场上同阵营英雄数量)，持续1回合
	this.before_action_red = otps.before_action_red || 0 		//本回合内，自身行动前受到的直接伤害降低
	this.action_flag = false 
	this.died_maxHp_damage = otps.died_maxHp_damage || 0 		//受到直接伤害死亡时，对击杀自身的英雄造成最大生命值伤害
	this.half_hp_red = otps.half_hp_red || false 				//若本回合内受到了超过生命上限50%的伤害，则本回合内后续受到直接伤害降至1点
	this.round_damage = 0
	this.mag_debuff_anger = otps.mag_debuff_anger || false  	//对敌方造成法术伤害时，如果目标处于异常状态，则使其怒气降低1点
	this.friend_ation_hp = otps.friend_ation_hp || 0 			//全局回合结束后，自身恢复(值*己方所有同阵营英雄回合内行动次数)生命
	this.ignore_shild = otps.ignore_shild || false 				//造成的物理伤害无视目标伤害吸收盾
	this.forbidden_amp = otps.forbidden_amp || 0 				//对重伤状态下的目标伤害提升
	this.died_resurgence = otps.died_resurgence || 0  			//战斗中首次死亡时复活，并恢复全部血量
	this.extra_count = 0 										//本回合额外行动次数
	//=========位置效果=======//
	this.hor_fri_reduction = otps["hor_fri_reduction"]	//横排英雄免伤加成
	this.hor_fri_my_maxHp = otps["hor_fri_my_maxHp"]	//横排英雄生命增加自身生命值比例
	this.ver_fri_reduction = otps["ver_fri_reduction"]	//纵排英雄免伤加成
	this.ver_fri_crit = otps["ver_fri_crit"]			//纵排英雄暴击加成
	this.ver_fri_slay = otps["ver_fri_slay"]			//纵排英雄爆伤加成
	this.ver_fri_my_atk = otps["ver_fri_my_atk"]		//纵排英雄攻击增加自身攻击比例
	this.ver_fri_amplify = otps["ver_fri_amplify"]		//纵排英雄伤害加成
	this.back_neglect_def = otps["back_neglect_def"]  	//位于后排时忽视防御
	this.back_crit = otps["back_crit"]  				//位于后排时暴击加成
	this.back_hitRate = otps["back_hitRate"]  			//位于后排时命中加成
	this.back_atk = otps["back_atk"]  					//位于后排时攻击加成
	this.back_amp = otps["back_amp"]  					//位于后排时伤害加成
	this.front_critDef = otps["front_critDef"]  		//位于前排时抗暴加成
	this.front_maxHP = otps["front_maxHP"]  			//位于前排时血量加成
	this.front_dodgeRate = otps["front_dodgeRate"]  	//位于前排时闪避加成
	this.front_reduction = otps["front_reduction"]  	//位于前排时免伤加成
	//=========饰品效果=======//
	this.phy_add = otps.phy_add || 0			//物理伤害加成
	this.mag_add = otps.mag_add || 0			//法术伤害加成
	this.phy_def = otps.phy_def || 0			//物理伤害减免
	this.mag_def = otps.mag_def || 0			//法术伤害减免
	this.neglect_def = otps.neglect_def || 0 	//忽视防御比例
	this.over_buff_maxHp = otps.over_buff_maxHp || 0	//伤害超出生命值上限时释放buff的生命值比例
	if(otps.over_buff_arg)
		this.over_buff_arg = JSON.parse(otps.over_buff_arg) || false 	//伤害超出生命值上限时释放buff的buff参数
	this.cf_rate = otps.cf_rate || 0			//攻击时有概率嘲讽目标，持续1回合，目标越少效果越好
	this.sw_acc = otps.sw_acc || false 	//携带神武饰品效果
	this.zh_acc = otps.zh_acc || false 	//携带智慧饰品效果
	this.sb_acc = otps.sb_acc || 0		//携带闪避饰品效果
	this.qh_acc = otps.qh_acc || false	//携带亲和饰品效果
	this.yh_acc = otps.yh_acc || false	//携带愈合饰品效果
	this.mz_acc = otps.mz_acc || false	//携带瞄准饰品效果
	this.wy_acc = otps.wy_acc || false	//携带威压饰品效果
	this.atkcontrol = otps.atkcontrol || 0 //控制概率增加
	this.defcontrol = otps.defcontrol || 0 //被控概率减免
	this.phy_turn_hp = otps.phy_turn_hp || 0 //物理伤害转生命值比例
	this.mag_turn_hp = otps.mag_turn_hp || 0 //法术伤害转生命值比例
	if(otps.first_armor)
		this.first_buff_list.push({buffId : "armor",duration : 2,buffArg : otps.first_armor}) //战斗前2回合免伤提高
	if(otps.first_amplify_mag)
		this.first_buff_list.push({buffId : "amplify_mag",duration : 2,buffArg : otps.first_amplify_mag}) //战斗前2回合法伤提高
	if(otps.first_amplify_phy)
		this.first_buff_list.push({buffId : "amplify_phy",duration : 2,buffArg : otps.first_amplify_phy}) //战斗前2回合物伤提高
	this.skill_rebound_ratio = otps.skill_rebound_ratio || 0 	//受到技能伤害反弹比例
	this.skill_rebound_prob = otps.skill_rebound_prob || 0		//受到技能伤害反弹概率
	this.mag_fluctuate = otps.mag_fluctuate || 0 	//法术伤害波动下限，上限为下限加0.2
	this.first_aid = otps.first_aid || 0			//受到直接攻击时，生命值低于40%回复生命比例，仅触发一次
	//=========觉醒效果=======//
	this.neglect_seckill = otps.neglect_seckill || false //免疫斩杀
	this.banLessAnger = otps.banLessAnger || false  //免疫减怒
	this.overDamageToMaxHp = otps.overDamageToMaxHp || 0 //溢出伤害对血量最高的敌方目标造成伤害比例
	this.invincibleAnger = otps.invincibleAnger || 0 //无敌盾增加怒气
	this.invincibleHeal = otps.invincibleHeal || 0 //无敌盾同阵营消失时恢复生命上限比例
	this.unpoison_heal = otps.unpoison_heal || 0   //同阵营解除中毒与治疗加成比例
	this.skill_must_hit = otps.skill_must_hit || false //技能必定命中
	this.realm_extra_buff_maxAtk = otps.realm_extra_buff_maxAtk || 0 //额外对敌方攻击最高目标释放BUFF概率（每个同阵营英雄加成）
	this.realm_extra_buff_minHp = otps.realm_extra_buff_minHp || 0 //额外对敌方血量最少目标释放BUFF概率（每个同阵营英雄加成）
	this.skill_crit_maxHp = otps.skill_crit_maxHp || 0 	//技能暴击造成的额外生命上限伤害
	this.realm_dizzy_amp = otps.realm_dizzy_amp || 0 //眩晕时同阵营英雄伤害加成
	if(otps.realm_heal_buff_minHp)
		this.realm_heal_buff_minHp = JSON.parse(otps.realm_heal_buff_minHp) || false //技能治疗目标中血量最少且同阵营英雄施加BUFF
	this.reduction_heal_maxHp = otps.reduction_heal_maxHp || 0 //释放减伤盾消失后恢复目标生命值上限
	this.skill_add_maxAtk_anger = otps.skill_add_maxAtk_anger || 0 //释放技能后恢复攻击最高队友怒气
	this.realm_friend_reduction = otps.realm_friend_reduction || 0 //每个存活的友方同阵营英雄提供伤害减免
	this.realm_friend_amp = otps.realm_friend_amp || 0 			   //每个存活的友方同阵营英雄提供伤害加成
	this.recover_maxHp = otps.recover_maxHp || 0	//持续治疗目标为同阵营英雄时,结算时额外回复其生命上限的血量
	this.invincibleSuper_again = otps.invincibleSuper_again //超级无敌消失时重复释放概率
	this.burn_hit_anger = otps.burn_hit_anger || 0 //被灼烧敌人攻击时回复怒气
	this.extraAtion = otps.extraAtion || false //释放技能后，怒气最少的其他同族英雄额外行动一回合。
	this.dizzy_less_anger = otps.dizzy_less_anger || 0 //释放技能附加的眩晕结束时，被眩晕的目标降低怒气
	this.dizzy_hit_anger = otps.dizzy_hit_anger || 0 //攻击受到眩晕效果的目标时，额外降低目标怒气。
	this.skill_amp_or_lessAnger = otps.skill_amp_or_lessAnger || 0 //释放技能时，如果目标怒气不足4点，技能伤害额外增加，如果目标怒气大于4点，额外降低目标1点怒气。
	this.heal_maxHp = otps.heal_maxHp || 0 //治疗时额外恢复目标英雄生命值百分比
	this.skill_add_realm3_anger = otps.skill_add_realm3_anger || 0 //释放技能后恢复同阵营怒气最少的三个英雄怒气值
	this.normal_atk_turn_hp = otps.normal_atk_turn_hp || 0 //受到普通攻击转化血量
	this.skill_atk_turn_hp = otps.skill_atk_turn_hp || 0 //受到技能攻击转化血量
	this.action_heal = otps.action_heal || 0	//行动后恢复血量百分比
	this.skill_add_maxAtk_realm_anger = otps.skill_add_maxAtk_realm_anger || 0 //释放技能后恢复同阵营攻击最高的英雄怒气值
	//=========宝石效果=======//
	this.kill_clear_buff = otps.kill_clear_buff || 0 //直接伤害击杀目标后，概率清除己方武将身上该目标死亡前释放的所有异常效果（灼烧、中毒、眩晕、沉默、麻痹）
	this.control_amp = otps.control_amp || 0 //攻击正在被控制（眩晕、沉默、麻痹）的目标时，增加伤害比例
	this.reduction_over = otps.reduction_over || 0 //受到武将直接伤害时，如果该伤害超过自身生命上限的40%，减免此次伤害的比例
	this.record_anger_rate = otps.record_anger_rate || 0 //释放技能后，概率获得本次技能消耗的50%的怒气，最多不超过4点
	this.round_anger_rate = otps.round_anger_rate || 0 //整体回合结束时，如果自身怒气低于4点，将怒气回复至4点的概率
	this.action_anger_s = otps.action_anger_s || 0 //自身行动后，回复自身1点怒气概率
	this.before_clear_debuff = otps.before_clear_debuff || 0 //自身回合开始前，移除自身所有的异常效果（灼烧、中毒、眩晕、沉默、麻痹、禁疗、心魔）的概率
	this.oneblood_rate = otps.oneblood_rate || 0 //受到致命伤害时保留一滴血概率
	this.target_anger_amp = otps.target_anger_amp || 0 //敌人超过4点怒气的部分，每点怒气提供伤害加成
	//=========元神效果=======//
	this.forbidden_shield = otps.forbidden_shield || 0 //治疗时，若目标处于禁疗状态，转化为护盾比例
	this.dizzy_clear_anger = otps.dizzy_clear_anger  //眩晕时清空目标所有怒气
	//=========特殊属性=======//
	this.burn_duration = otps.burn_duration || 0 //灼烧持续时间增长
	this.poison_duration = otps.poison_duration || 0 //中毒持续时间增长
	this.poison_change_hp = otps.poison_change_hp || 0 //造成的中毒伤害转化为血量治疗自己。
	this.poison_settle = otps.poison_settle || 0 		//中毒立即结算

	this.less_skill_buffRate = otps.less_skill_buffRate || 0 //技能最高提升buff概率(目标越多效果越低)
	this.less_normal_buffRate = otps.less_normal_buffRate || 0 //普攻最高提升buff概率(目标越多效果越低)
	this.less_buff_arg = otps.less_buff_arg || 0	//提升buff效果(目标越多效果越低)
	this.less_clear_invincible = otps.less_clear_invincible || 0 //清除敌方武将无敌概率（目标越多效果越低）

	this.control_buff_lowrate = otps.control_buff_lowrate || 0 //被控制概率降低（麻痹、沉默、眩晕）
	this.damage_buff_lowrate = otps.damage_buff_lowrate || 0 //降低受到的灼烧、中毒概率
	this.damage_buff_lowArg = otps.damage_buff_lowArg || 0 //降低受到的灼烧、中毒伤害

	this.enemy_vertical_anger = otps.enemy_vertical_anger || 0	//攻击纵排目标时降低敌人怒气
	this.action_clean_debuff = otps.action_clean_debuff 	//每回合行动前，清除所有自身非控制类负面状态
	this.action_clean_hp = otps.action_clean_hp || 0		//每清除自身一个负面状态，恢复自身生命值比例
	this.always_immune = otps.always_immune					//永久免控
	
	this.must_crit = false						//攻击必定暴击
	this.next_must_crit = false					//下回合攻击暴击

	this.ignoreInvincible = otps.ignoreInvincible || false //攻击忽视无敌盾效果 
	this.realmDiedSkill = otps.realmDiedSkill || false	//同阵营武将受直接伤害死亡后释放技能
	this.cfRed = otps.cfRed || 0	//嘲讽减伤
	this.over_heal_shield = otps.over_heal_shield || 0  //治疗溢出转吸收盾比例

	this.heal_min_hp_rate = otps.heal_min_hp_rate || 0 	//对己方血量最少武将治疗加成
	this.heal_min_hp3_rate = otps.heal_min_hp3_rate || 0 	//对己方血量最少3个武将治疗加成
	//=========击杀效果=======//
	this.kill_anger = otps.kill_anger || 0		//直接伤害击杀目标回复怒气
	this.kill_amp = otps.kill_amp || 0			//直接伤害每击杀一个目标提升伤害
	this.kill_crit = otps.kill_crit || 0		//直接伤害每击杀一个目标提升暴击
	this.kill_slay = otps.kill_slay || 0		//直接伤害每击杀一个目标提升暴击伤害
	this.kill_add_d_s = otps.kill_add_d_s		//直接伤害击杀目标后追加普通攻击
	this.kill_heal = otps.kill_heal || 0		//直接伤害击杀目标后，恢复自身生命值上限
	this.kill_must_crit = otps.kill_must_crit	//直接伤害击杀目标后，下回合攻击必定暴击
	this.kill_rob_anger = otps.kill_rob_anger 	//技能直接击杀敌方目标时，获得目标剩余的所有怒气
	this.kill_burn_heal = otps.kill_burn_heal || 0 //直接伤害击杀灼烧目标后，回复自身生命值百分比
	if(otps.kill_later_skill){
		this.kill_later_skill = JSON.parse(otps.kill_later_skill)	//直接伤害击杀后追加技能
	}
	//=========释放技能=======//
	this.skill_free = otps.skill_free || 0					//释放技能不消耗怒气值概率
	this.skill_attack_amp = otps.skill_attack_amp || 0		//技能伤害加成
	this.skill_attack_def = otps.skill_attack_def || 0		//技能伤害减免
	this.skill_heal_amp = otps.skill_heal_amp || 0			//技能治疗量加成
	this.skill_turn_rate = otps.skill_turn_rate || 0		//技能伤害转化成生命值百分比
	this.skill_turn_tg = otps.skill_turn_tg || 0			//技能伤害转化的生命值作用目标
	this.skill_add_d_s = otps.skill_add_d_s					//释放技能后追加普通攻击
	this.skill_anger_s = otps.skill_anger_s || 0			//释放技能后恢复自身怒气
	this.skill_anger_a = otps.skill_anger_a || 0			//释放技能后恢复全体队友怒气
	this.skill_anger_back = otps.skill_anger_back || 0		//释放技能后回复己方后排怒气
	this.skill_anger_first = otps.skill_anger_first || 0	//释放技能后，回复当前本方阵容站位最靠前的武将怒气
	this.skill_less_anger = otps.skill_less_anger || 0		//释放技能后降低目标怒气
	this.skill_hor_anger = otps.skill_hor_anger || 0 		//释放技能后增加横排英雄怒气
	this.skill_ver_anger = otps.skill_ver_anger || 0 		//释放技能后增加纵排英雄怒气
	this.skill_burn_turn_heal = otps.skill_burn_turn_heal || 0//如果目标处于灼烧状态，技能直接伤害的百分比转化为生命治疗自己
	this.skill_less_amp = otps.skill_less_amp || 0			//技能目标每减少一个伤害加成比例
	this.skill_burn_anger = otps.skill_burn_anger || 0		//技能每命中一个燃烧状态下的目标恢复自身怒气
	this.skill_flash_anger = otps.skill_flash_anger || 0    //技能每命中一个感电状态下的目标恢复自身怒气
	this.skill_frozen_anger = otps.skill_frozen_anger || 0 	// 使用技能攻击时，若目标处于冰冻状态，恢复自身1点怒气

	if(otps.skill_later_skill){
		this.skill_later_skill = JSON.parse(otps.skill_later_skill)	//释放技能后后追加技能
	}

	this.hit_turn_rate = otps.hit_turn_rate || 0	//受到直接伤害转化成生命值百分比
	this.hit_turn_tg = otps.hit_turn_tg || 0		//受到直接伤害转化的生命值作用目标
	this.hit_rebound = otps.hit_rebound || 0		//受到直接物理伤害反弹比例

	this.hit_less_anger = otps.hit_less_anger || 0	//受到普通攻击后，降低攻击自己的武将怒气
	this.hit_anger_s = otps.hit_anger_s || 0 		//受到普通攻击后，回复自己的怒气
	if(otps.hit_buff){
		this.hit_buff = JSON.parse(otps.hit_buff)	//受到伤害给攻击者附加BUFF
	}
	if(otps.hit_normal_buff){
		this.hit_normal_buff = JSON.parse(otps.hit_normal_buff)	//受到普通攻击给攻击者附加BUFF
	}
	if(otps.hit_skill_buff){
		this.hit_skill_buff = JSON.parse(otps.hit_skill_buff)	//受到技能攻击释放buff
	}
	this.normal_crit = otps.normal_crit || false 				//普攻必定暴击(含治疗)	
	this.normal_heal_amp = otps.normal_heal_amp || 0			//普攻治疗量加成
	this.normal_add_anger = otps.normal_add_anger || 0			//普攻后恢复自身怒气
	this.normal_less_anger = otps.normal_less_anger || 0		//普攻后降低目标怒气
	this.normal_attack_amp = otps.normal_attack_amp || 0		//普攻伤害加成
	this.normal_burn_turn_heal = otps.normal_burn_turn_heal || 0//如果目标处于灼烧状态，普攻直接伤害的百分比转化为生命治疗自己
	this.add_d_s_crit = otps.add_d_s_crit						//追加普攻必定暴击
	this.add_default_amp = otps.add_default_amp || 0			//追加普攻伤害加成
	this.add_default_maxHp = otps.add_default_maxHp || 0		//追加普攻生命上限伤害
	this.add_skill_amp = otps.add_skill_amp || 0 				//追加技能伤害加成

	this.action_anger = otps.action_anger || 0				//行动后回复自身怒气

	this.low_hp_amp = otps.low_hp_amp || 0					//战斗中自身生命每降低10%，伤害加成
	this.low_hp_crit = otps.low_hp_crit || 0				//战斗中自身生命每降低10%，暴击加成
	this.low_hp_dodge = otps.low_hp_dodge || 0				//战斗中自身生命每降低10%，闪避加成
	this.low_hp_heal = otps.low_hp_heal || 0				//目标血量每减少10%，对其造成的的治疗量加成
	this.enemy_died_amp = otps.enemy_died_amp || 0			//敌方每阵亡一人，伤害加成比例

	this.single_less_anger = otps.single_less_anger || 0 	//攻击单体目标额外降低怒气
	this.first_resurgence = otps.first_resurgence || 0 		//首次死亡复活概率
	this.resurgence_self = otps.resurgence_self || 0 		//死亡后复活概率，恢复全部血量
	this.resurgence_team = otps.resurgence_team || 0		//复活本方第1位阵亡的武将，并恢复其50%的生命，每场战斗只可触发1次
	this.resurgence_realmRate = otps.resurgence_realmRate || 0 //同阵营复活血量倍率
	this.burn_hit_reduction = otps.burn_hit_reduction || 0	//被灼烧状态敌人攻击伤害减免

	if(otps.burn_att_change_skill)
		this.burn_att_change_skill = JSON.parse(otps.burn_att_change_skill)			//灼烧状态属性修改
	if(otps.burn_buff_change_skill)
		this.burn_buff_change_skill = JSON.parse(otps.burn_buff_change_skill)		//灼烧状态附加BUFF修改
	if(otps.burn_att_change_normal)
		this.burn_att_change_normal = JSON.parse(otps.burn_att_change_normal)			//灼烧状态属性修改
	if(otps.burn_buff_change_normal)
		this.burn_buff_change_normal = JSON.parse(otps.burn_buff_change_normal)		//灼烧状态附加BUFF修改
	this.burn_not_invincible = otps.burn_not_invincible   		//被灼烧的武将无法获得无敌和无敌吸血盾效果
	this.poison_add_forbidden = otps.poison_add_forbidden 		//中毒buff附加禁疗
	this.banAnger_add_forbidden = otps.banAnger_add_forbidden 	//禁怒buff附加禁疗
	if(otps.first_nocontrol)
		this.first_buff_list.push({buffId : "immune",duration : 1})	//首回合免控
	if(otps.zf_sjms)
		this.first_buff_list.push({buffId : "immune",duration : 2})	//前2回合免控
	this.first_crit = otps.first_crit			//首回合必定暴击
	this.first_amp = otps.first_amp || 0		//首回合伤害加成
	if(this.first_crit)
		this.must_crit = true
	
	this.died_use_skill = otps.died_use_skill				//死亡时释放一次技能
	this.died_burn_buff_must = otps.died_burn_buff_must 	//死亡释放buff时必定命中
	if(otps.died_later_buff)
		this.died_later_buff = JSON.parse(otps.died_later_buff)	//直接伤害死亡时对击杀者释放buff
	this.maxHP_damage = otps.maxHP_damage || 0					//技能附加最大生命值真实伤害
	this.maxHP_rate = otps.maxHP_rate							//进入战斗时最大生命加成倍数
	this.maxHP_loss = otps.maxHP_loss							//每回合生命流失率
	this.round_amplify = otps.round_amplify || 0				//每回合伤害加成
	this.behit_amplify = otps.behit_amplify || 0 				//每受到一次伤害，自身伤害永久增加
	this.behit_value = 0										//累计受击伤害加成
	this.damage_save = otps.damage_save							//释放技能时,上回合受到的所有伤害将100%额外追加伤害
	this.damage_save_value = 0									//累积伤害值 
	this.heal_unControl = otps.heal_unControl					//释放技能时，解除目标被控制状态
	this.heal_addAnger = otps.heal_addAnger  					//释放技能时，增加目标怒气值
	this.dispel_intensify = otps.dispel_intensify				//释放技能时，驱散目标身上所有增益效果(增伤、减伤、持续恢复)
	this.damage_change_shield = otps.damage_change_shield || 0	//伤害转吸收盾比例
	this.mag_change_shield = otps.mag_change_shield || 0		//法术伤害转吸收盾比例
	//=========状态=======//
	this.died = this.attInfo.maxHP && this.attInfo.hp ? false : true 	//死亡状态
	if(this.died)
		this.isNaN = true
	this.buffs = {}					//buff列表
	//=========属性加成=======//
	this.self_adds = {}							//自身百分比加成属性
	this.team_adds = {}							//全队百分比加成属性
	this.show_adds = {}							//总百分比加成
	if(otps.self_atk_add)
		this.self_adds["atk"] = otps.self_atk_add
	if(otps.self_maxHP_add)
		this.self_adds["maxHP"] = otps.self_maxHP_add
	if(otps.self_phyDef_add)
		this.self_adds["phyDef"] = otps.self_phyDef_add
	if(otps.self_magDef_add)
		this.self_adds["magDef"] = otps.self_magDef_add
	if(otps.self_speed_add)
		this.self_adds["speed"] = otps.self_speed_add
	if(otps.team_atk_add)
		this.team_adds["atk"] = otps.team_atk_add
	if(otps.team_maxHP_add)
		this.team_adds["maxHP"] = otps.team_maxHP_add
	if(otps.team_amplify_add)
		this.team_adds["amplify"] = otps.team_amplify_add
	if(otps.team_reduction_add)
		this.team_adds["reduction"] = otps.team_reduction_add
	if(otps.team_hitRate_add)
		this.team_adds["hitRate"] = otps.team_hitRate_add
	if(otps.team_dodgeRate_add)
		this.team_adds["dodgeRate"] = otps.team_dodgeRate_add
	if(otps.team_phyDef_add)
		this.team_adds["phyDef"] = otps.team_phyDef_add
	if(otps.team_magDef_add)
		this.team_adds["magDef"] = otps.team_magDef_add
	if(otps.team_slay_add)
		this.team_adds["slay"] = otps.team_slay_add
	if(otps.team_slayDef_add)
		this.team_adds["slayDef"] = otps.team_slayDef_add	
	if(otps.team_crit_add)
		this.team_adds["crit"] = otps.team_crit_add
	if(otps.team_critDef_add)
		this.team_adds["critDef"] = otps.team_critDef_add
	//=========阵营属性加成======//
	if(otps["amplify_"+this.realm])
		this.addAttInfo("amplify",otps["amplify_"+this.realm])
	if(otps["crit_"+this.realm])
		this.addAttInfo("crit",otps["crit_"+this.realm])
	if(otps["critDef_"+this.realm])
		this.addAttInfo("critDef",otps["critDef_"+this.realm])
	if(otps["reduction_"+this.realm])
		this.addAttInfo("reduction",otps["reduction_"+this.realm])
	if(otps["hitRate_"+this.realm])
		this.addAttInfo("hitRate",otps["hitRate_"+this.realm])
	if(otps["dodgeRate_"+this.realm])
		this.addAttInfo("dodgeRate",otps["dodgeRate_"+this.realm])
	
	if(otps["phy_amp_"+this.realm])
		this.addTalentValue("phy_add",otps["phy_amp_"+this.realm])
	if(otps["mag_amp_"+this.realm])
		this.addTalentValue("mag_add",otps["mag_amp_"+this.realm])
	if(otps["phyDef_add_"+this.realm])
		this.addTalentValue("phy_def",otps["phyDef_add_"+this.realm])
	if(otps["magDef_add_"+this.realm])
		this.addTalentValue("mag_def",otps["magDef_add_"+this.realm])
	//=======属性加成======//
	if(this.lv > 100){
		var lvdif = this.lv - 100
		if(otps.atk_grow)
			this.attInfo.atk += Math.ceil(otps.atk_grow * lvdif) || 0
		if(otps.maxHP_grow){
			this.attInfo.maxHP += Math.ceil(otps.maxHP_grow * lvdif) || 0
			this.attInfo.hp = this.attInfo.maxHP
		}
		if(otps.phyDef_grow)
			this.attInfo.phyDef += Math.ceil(otps.phyDef_grow * lvdif) || 0
		if(otps.magDef_grow)
			this.attInfo.magDef += Math.ceil(otps.magDef_grow * lvdif) || 0
	}
	//=========技能=======//
	//入场技能
	if(otps.beginSkill)
		this.beginSkill = skillManager.createSkill(otps.beginSkill,this)
	if(otps.defaultSkill)
		this.defaultSkill = skillManager.createSkill(otps.defaultSkill,this)				//普通技能
	if(otps.angerSkill){
		this.angerSkill = skillManager.createSkill(otps.angerSkill,this)		//怒气技能
		this.angerSkill.isAnger = true
		if(this.skill_heal_maxHp)
			this.angerSkill.self_heal = this.skill_heal_maxHp
		this.needAnger = this.angerSkill.needAnger
	}
	this.target_minHP = otps.target_minHP		//单体输出武将的所有攻击优先攻击敌方当前血量最低的武将
	if(this.target_minHP){
		this.defaultSkill.targetType = "enemy_minHP"
		this.angerSkill.targetType = "enemy_minHP"
		if(this.kill_later_skill && this.kill_later_skill.targetType == "enemy_1"){
			this.kill_later_skill.targetType = "enemy_minHP"
		}
	}
	if(this.atkcontrol){
		for(var id in this.angerSkill.skill_buffs){
			if(this.angerSkill.skill_buffs[id].buffId == "disarm" || this.angerSkill.skill_buffs[id].buffId == "dizzy" || this.angerSkill.skill_buffs[id].buffId == "silence")
				this.angerSkill.skill_buffs[id].buffRate += this.angerSkill.skill_buffs[id].buffRate * this.atkcontrol
		}
	}
}
model.prototype.init = function(fighting) {
	this.fighting = fighting
	if(this.otps.normal_buffs)
		for(var i = 0;i < this.otps.normal_buffs.length;i++)
			this.defaultSkill.addBuff(this.otps.normal_buffs[i])
	if(this.otps.skill_buffs)
		for(var i = 0;i < this.otps.skill_buffs.length;i++)
			this.angerSkill.addBuff(this.otps.skill_buffs[i])
	if(this.otps.round_buffs){
		for(var i = 0;i < this.otps.round_buffs.length;i++)
			this.round_buffs.push(JSON.parse(this.otps.round_buffs[i]))
	}
	if(this.otps.first_buffs)
		for(var i = 0;i < this.otps.first_buffs.length;i++)
			this.addFirstBuff(JSON.parse(this.otps.first_buffs[i]))
	if(this.otps.action_buffs)
		for(var i = 0;i < this.otps.action_buffs.length;i++)
			this.addActionBuff(this.otps.action_buffs[i])
	if(this.otps.kill_buffs)
		for(var i = 0;i < this.otps.kill_buffs.length;i++)
			this.addKillBuff(this.otps.kill_buffs[i])
	if(this.otps.died_buffs)
		for(var i = 0;i < this.otps.died_buffs.length;i++)
			this.addDiedBuff(this.otps.died_buffs[i])
	if(this.seckill)
		this.angerSkill.seckill = true
	this.attInfo.speed += this.fighting.seeded.random("随机速度") * 0.5
}
//选择技能
model.prototype.chooseSkill = function() {
	if(this.died)
		return false
	//怒气不足跳过回合回怒
	if(this.less_anger_skip && this.curAnger < 4){
		fightRecord.push({type:"show_tag",id:this.id,tag:"less_anger_skip"})
		this.addAnger(4)
		return false
	}
	if(!this.fighting.locator.existsTarget(this)){
		this.addAnger(2,true)
		return false
	}
	//被嘲讽使用普攻
	if(this.buffs["chaofeng"] && this.defaultSkill.type != "heal"){
		if(!this.buffs["disarm"])
			return this.userNormalSkill()
	}
	//被控制跳过回合
	if(!this.checkActionable())
		return false
	//非沉默状态判断怒气
	if(!this.buffs["silence"] && this.angerSkill){
		if(this.curAnger >= this.needAnger || this.anyAnger)
			return this.userAngerSkill()
	}
	if(!this.buffs["disarm"])
		return this.userNormalSkill()
}
//使用怒气技能消耗怒气
model.prototype.userAngerSkill = function() {
	if(this.died || !this.checkActionable() || this.buffs["silence"])
		return false
	var needAnger = this.needAnger
	var needValue = 0
	var skill = false
	//怒气足够
	if(this.curAnger >= this.needAnger){
		skill = this.angerSkill
		needValue = this.needAnger
		//消耗所有怒气
		if(this.allAnger){
			fightRecord.push({type:"show_tag",id:this.id,tag:"allAnger"})
			needValue = this.curAnger
		}
	}else if(this.anyAnger){
		//怒气不足也可以放技能
		fightRecord.push({type:"show_tag",id:this.id,tag:"anyAnger"})
		skill = this.angerSkill
		needValue = this.curAnger
	}
	if(skill){
		skill.angerAmp = (needValue - 4) * 0.15
		if(this.skill_free && this.fighting.seeded.random("不消耗怒气判断") < this.skill_free)
			needValue = 0
		if(needValue){
			this.lessAnger(needValue,needValue == 4 ? true:false,true)
			if(this.record_anger_rate && this.fighting.seeded.random("判断回怒") < this.record_anger_rate){
				needValue = Math.floor(needValue/2)
				if(needValue){
					this.addAnger(Math.min(needValue,4))
				}
			}
		}
	}
	return skill
}
//使用普攻技能获得怒气
model.prototype.userNormalSkill = function() {
	this.addAnger(2,true)
	return this.defaultSkill
}
//添加属性
model.prototype.addAttInfo = function(key,value) {
	if(this.attInfo[key] !== undefined)
		this.attInfo[key] += Number(value) || 0
}
//添加属性
model.prototype.addTalentValue = function(key,value) {
	if(!this[key])
		this[key] = 0
	this[key] += Number(value) || 0
}
//百分比属性加成
model.prototype.calAttAdd = function(team_adds) {
	this.show_adds = Object.assign({},this.self_adds)
	for(var i in team_adds){
		if(!this.show_adds[i]){
			this.show_adds[i] = team_adds[i]
		}else{
			this.show_adds[i] += team_adds[i]
		}
	}
	for(var i in this.show_adds){
		switch(i){
			case "atk":
			case "maxHP":
			case "phyDef":
			case "magDef":
			case "speed":
				this.attInfo[i] += Math.ceil(this.attInfo[i] * this.show_adds[i])
			break
			case "curAnger":
				this.curAnger += this.show_adds[i]
			break
			default:
				this.attInfo[i] += this.show_adds[i]
		}
	}
	for(var i in this.heroAtts){
		this.attInfo[i] += this.heroAtts[i]
	}
	this.attInfo.hp = this.attInfo.maxHP
}
//站位加成
model.prototype.siteInit = function() {
	if(this.hor_fri_reduction){
		var list = this.fighting.locator.getFriendVertical(this)
		for(var i = 0;i < list.length;i++){
			list[i].attInfo.reduction += this.hor_fri_reduction
		}
	}
	if(this.hor_fri_my_maxHp){
		var list = this.fighting.locator.getFriendVertical(this)
		for(var i = 0;i < list.length;i++){
			list[i].attInfo.maxHP += Math.floor(this.hor_fri_my_maxHp * this.attInfo.maxHP)
		}
	}
	if(this.ver_fri_reduction){
		var list = this.fighting.locator.getFriendHorizontal(this)
		for(var i = 0;i < list.length;i++){
			list[i].attInfo.reduction += this.ver_fri_reduction
		}
	}
	if(this.ver_fri_crit){
		var list = this.fighting.locator.getFriendHorizontal(this)
		for(var i = 0;i < list.length;i++){
			list[i].attInfo.crit += this.ver_fri_crit
		}
	}
	if(this.ver_fri_slay){
		var list = this.fighting.locator.getFriendHorizontal(this)
		for(var i = 0;i < list.length;i++){
			list[i].attInfo.slay += this.ver_fri_slay
		}
	}
	if(this.ver_fri_my_atk){
		var list = this.fighting.locator.getFriendHorizontal(this)
		for(var i = 0;i < list.length;i++){
			list[i].attInfo.atk += Math.floor(this.ver_fri_my_atk * this.attInfo.atk)
		}
	}
	if(this.ver_fri_amplify){
		var list = this.fighting.locator.getFriendHorizontal(this)
		for(var i = 0;i < list.length;i++){
			list[i].phy_add += this.ver_fri_amplify
			list[i].mag_add += this.ver_fri_amplify
		}
	}
	if(this.index < 3){
		//前排
		if(this.front_critDef)
			this.attInfo.critDef += this.front_critDef
		if(this.front_dodgeRate)
			this.attInfo.dodgeRate += this.front_dodgeRate
		if(this.front_maxHP){
			this.attInfo.maxHP += Math.floor(this.attInfo.maxHP * this.front_maxHP)
		}
		if(this.front_reduction){
			this.attInfo.reduction += this.front_reduction
		}
	}else{
		//后排
		if(this.back_neglect_def)
			this.neglect_def += this.back_neglect_def
		if(this.back_crit)
			this.attInfo.crit += this.back_crit
		if(this.back_hitRate)
			this.attInfo.hitRate += this.back_hitRate
		if(this.back_atk){
			this.attInfo.atk += Math.floor(this.attInfo.atk * this.back_atk)
		}
		if(this.back_amp)
			this.attInfo.amplify += this.back_amp
	}
}
//英雄战斗 开始
model.prototype.begin = function() {
	this.beginAction()
}
//战前准备
model.prototype.beginAction = function() {
	if(this.maxHP_rate)
		this.attInfo.maxHP = Math.floor(this.attInfo.maxHP * this.maxHP_rate)
	this.attInfo.hp = this.attInfo.maxHP
	if(this.isBoss){
		this.attInfo.hp = 99999999999
	}
	if(this.surplus_health === 0){
		this.attInfo.hp = 0
		this.died = true
	}else if(this.surplus_health){
		this.attInfo.hp = Math.ceil(this.attInfo.hp * this.surplus_health)
	}
	if(!this.died)
		this.siteInit()
	if(this.first_buff_list.length){
		for(var j = 0;j < this.first_buff_list.length;j++){
			if(this.first_buff_list[j]["buff_tg"]){
				var targets = this.fighting.locator.getBuffTargets(this,this.first_buff_list[j]["buff_tg"])
				for(var k = 0;k < targets.length;k++){
					if(targets[k].died)
						continue
					buffManager.createBuff(this,targets[k],this.first_buff_list[j])
				}
			}else{
				buffManager.createBuff(this,this,this.first_buff_list[j])
			}
		}
	}
	if(this.first_realm_buff){
		for(var j = 0;j < this.team.length;j++)
			if(!this.team[j].died)
				buffManager.createBuff(this,this.team[j],this.first_realm_buff)
	}
	if(this.begin_realm_crit){
		fightRecord.push({type:"show_tag",id:this.id,tag:"begin_realm_crit"})
		for(var j = 0;j < this.team.length;j++){
			if(!this.team[j].died)
				buffManager.createBuff(this,this.team[j],{buffId : "crit",buffArg : this.begin_realm_crit * this.atkTeamInfo["realms"][this.realm],duration : 1})
		}
	}
	if(this.ignoreInvincible)
		fightRecord.push({type:"show_tag",id:this.id,tag:"ignoreInvincible"})
	if(this.ignore_shild)
		fightRecord.push({type:"show_tag",id:this.id,tag:"ignore_shild"})
	if(this.half_hp_red)
		fightRecord.push({type:"show_tag",id:this.id,tag:"half_hp_red"})
	if(this.dodgeFirst)
		this.dodgeState = true
}
//英雄出场
model.prototype.heroComeon = function() {
	if(this.enter_skill)
		skillManager.useSkill(this.angerSkill)
	if(this.beginSkill)
		skillManager.useSkill(this.beginSkill)
}
//检查可行动
model.prototype.checkActionable = function() {
	if(this.died || this.buffs["dizzy"] || this.buffs["frozen"] || this.buffs["banish"])
		return false
	else
		return true
}
//行动开始前刷新
model.prototype.before = function() {
	this.action_flag = true
	this.onAction = true
	this.chaseFlag = false
	if(this.before_clear_debuff && this.fighting.seeded.random("判断BUFF命中率") < this.before_clear_debuff){
		for(var i in this.buffs)
			if(buff_cfg[i].debuff)
				this.buffs[i].destroy("clear")
	}
	if(this.action_clean_debuff){
		var count = this.removeDeBuffNotControl()
		if(this.action_clean_hp && count){
			var tmpRecord = {type : "other_heal",targets : []}
			tmpRecord.targets.push(this.onHeal(this,{maxRate : this.action_clean_hp * count}))
			fightRecord.push(tmpRecord)
		}
	}
	if(this.remove_one_lower)
		this.removeOneLower()
	//伤害BUFF刷新
	for(var i in this.buffs)
		if(buff_cfg[i].refreshType == "before")
			this.buffs[i].update()
	//伤害BUFF刷新
	for(var i in this.buffs)
		if(buff_cfg[i].refreshType == "before_2")
			this.buffs[i].update()
	//随机BUFF判断
	if(this.begin_round_buffs){
		var rand = Math.floor(this.fighting.seeded.random("begin_round_buffs") * this.begin_round_buffs.length)
		buffManager.createBuff(this,this,this.begin_round_buffs[rand])
	}
}
//行动结束后刷新
model.prototype.after = function() {
	//状态BUFF刷新
	this.onAction = false
	if(this.died)
		return
	//行动后回怒
	if(this.action_anger)
		this.addAnger(this.action_anger)
	//行动结束BUFF
	for(var i in this.action_buffs){
		var buffInfo = this.action_buffs[i]
		var buffTargets = this.fighting.locator.getBuffTargets(this,buffInfo.buff_tg)
		for(var k = 0;k < buffTargets.length;k++){
			if(this.fighting.seeded.random("判断BUFF命中率") < buffInfo.buffRate){
				buffManager.createBuff(this,buffTargets[k],{buffId : buffInfo.buffId,buffArg : buffInfo.buffArg,duration : buffInfo.duration})
			}
		}
	}
	//行动结束回怒概率
	if(this.action_anger_s && this.fighting.seeded.random("行动后怒气") < this.action_anger_s)
		this.addAnger(1)
	//行动结束回血
	if(this.action_heal){
		var recordInfo =  this.onHeal(this,{type : "heal",maxRate : this.action_heal})
		recordInfo.type = "self_heal"
		fightRecord.push(recordInfo)
	}
	this.teamInfo["realms_ation"][this.realm]++
	//行动后额外行动概率
	if(this.action_extra_action && this.action_extra_flag){
		if(this.fighting.seeded.random("action_extra_action") < this.action_extra_action){
			fightRecord.push({type:"show_tag",id:this.id,tag:"action_extra_action"})
			this.action_extra_flag = false
			this.fighting.next_character.push(this)
		}
	}
	//判断复活队友
	if(this.fighting.teamDiedList[this.belong].length && this.isPassive("fh_dy")){
		var index = Math.floor(this.fighting.seeded.random("fh_dy") * this.fighting.teamDiedList[this.belong].length)
		index = this.fighting.teamDiedList[this.belong][index]
		this.team[index].resurgence(this.getTotalAtt("atk") * this.getPassiveArg("fh_dy"),this)
	}
	//转移诅咒
	if(this.isPassive("zy_zz")){
		var count = 0
		for(var i = 0;i < this.team.length;i++){
			count += this.team[i].removeOneLower()
		}
		if(count){
			var targets = this.fighting.locator.getTargets(this,"enemy_1")
			if(targets[0])
				buffManager.createBuff(this,targets[0],{"buffId":"curse","buff_tg":"skill_targets","buffArg":count,"duration":3,"buffRate":1})
		}
	}
	//冰霜回合结束冰冻判断
	if(this.buffs["frost"] && this.buffs["frost"].getValue() >= 10){
		var targets = this.fighting.locator.getBuffTargets(this,"enemy_1")
		if(targets[0])
			buffManager.createBuff(this,targets[0],{buffId : "frozen",duration : 1})
	}
	for(var i in this.buffs)
		if(buff_cfg[i].refreshType == "after")
			this.buffs[i].update()
	if(this.maxHP_loss > 0){
		this.onHPLoss()
	}
	if(this.round_heal_type && this.round_heal_value){
		var tmpRecord = {type : "other_heal",targets : []}
		var targets = this.fighting.locator.getTargets(this,this.round_heal_type)
		for(var i = 0;i < targets.length;i++){
			var info = this.fighting.formula.calHeal(this,targets[i],Math.floor(this.getTotalAtt("atk") * this.round_heal_value),{})
			info = targets[i].onHeal(this,info,{})
			tmpRecord.targets.push(info)
		}
		fightRecord.push(tmpRecord)
	}
	this.damage_save_value = 0
	if(this.master)
		this.master.heroAfter()
}
//整体回合开始
model.prototype.roundBegin = function() {
	if(!this.comeon || this.died)
		return
	//回合开始时前BUFF
	for(var i = 0;i < this.round_buffs.length;i++){
		var buffInfo = this.round_buffs[i]
		var buffTargets = this.fighting.locator.getBuffTargets(this,buffInfo.buff_tg)
		for(var k = 0;k < buffTargets.length;k++){
			if(this.fighting.seeded.random("判断BUFF命中率") < buffInfo.buffRate){
				buffManager.createBuff(this,buffTargets[k],buffInfo)
			}
		}
	}
}
//整体回合结束
model.prototype.roundOver = function() {
	if(!this.comeon)
		return
	if(this.buffs["delay_death"] && this.buffs["delay_death"].duration == 1){
		this.buffs["delay_death"].destroy()
		if(this.attInfo.hp <= 0){
			var tmpRecord = {type : "other_damage",value : -this.attInfo.hp,d_type:"mag"}
			this.attInfo.hp = 0
			tmpRecord = this.onHit(this,tmpRecord)
			fightRecord.push(tmpRecord)
		}
	}
	//状态BUFF刷新
	for(var i in this.buffs)
		if(buff_cfg[i].refreshType == "roundOver" || buff_cfg[i].refreshType == "always")
			this.buffs[i].update()
	if(this.died)
		return
	for(var i in this.passives)
		this.passives[i].roundUpdate()
	if(this.dodgeFirst)
		this.dodgeState = true
	if(this.round_same_hit_red)
		this.round_same_value = {}
	var rate = this.attInfo.hp / this.attInfo.maxHP
	if(rate < 0.5){
		if(this.less_half_hp_heal){
			var recordInfo =  this.onHeal(this,{type : "heal",maxRate : this.less_half_hp_heal})
			recordInfo.type = "self_heal"
			fightRecord.push(recordInfo)
		}
	}else{
		if(this.more_half_hp_buff){
			buffManager.createBuff(this,this,{buffId : this.more_half_hp_buff.buffId,buffArg : this.more_half_hp_buff.buffArg,duration : this.more_half_hp_buff.duration})
		}
	}
	if(this.friend_ation_hp){
		fightRecord.push({type:"show_tag",id:this.id,tag:"friend_ation_hp"})
		var rate = this.teamInfo.realms_ation[this.realm] * this.friend_ation_hp
		var recordInfo =  this.onHeal(this,{type : "heal",maxRate : rate})
		recordInfo.type = "self_heal"
		fightRecord.push(recordInfo)
	}
	if(this.buffs["kb_boss2"] || this.buffs["huosheng"]){
		var recordInfo =  this.onHeal(this,{type : "heal",maxRate : 0.3})
		recordInfo.type = "self_heal"
		fightRecord.push(recordInfo)
	}
	//圣火加血
	if(this.buffs["flame"]){
		var tmpRecord = {type : "other_heal",targets : []}
		var targets = this.fighting.locator.getTargets(this,"team_all")
		var healValue = Math.floor(this.getTotalAtt("atk") * 0.2 * this.buffs["flame"].getValue())
		for(var i = 0;i < targets.length;i++){
			var info = this.fighting.formula.calHeal(this,targets[i],healValue,{})
			info = targets[i].onHeal(this,info,{})
			tmpRecord.targets.push(info)
		}
		fightRecord.push(tmpRecord)
	}
	this.phy_turn_value = 0
	this.half_hp_shild_flag = true
	this.first_beSkill_flag = true
	this.onHit_extra_flag = true
	this.action_extra_flag = true
	this.action_flag = false
	this.round_damage = 0
	this.extra_count = 0
}
//移除控制状态
model.prototype.removeControlBuff = function() {
	//状态BUFF刷新
	for(var i in this.buffs)
		if(buff_cfg[i].control)
			this.buffs[i].destroy("clear")
}
//移除非控制类负面状态
model.prototype.removeDeBuffNotControl = function() {
	if(this.buffs["moyin"])
		return 0
	var count = 0
	//状态BUFF刷新
	for(var i in this.buffs){
		if(buff_cfg[i].lower){
			count++
			this.buffs[i].destroy("clear")
		}
	}
	return count
}
//解除一个减益状态
model.prototype.removeOneLower = function() {
	if(this.buffs["moyin"])
		return 0
	for(var i in this.buffs){
		if(buff_cfg[i].lower){
			this.buffs[i].destroy("clear")
			return 1
		}
	}
	return 0
}
//驱散增益状态
model.prototype.removeIntensifyBuff = function() {
	var count = 0
	//状态BUFF刷新
	for(var i in this.buffs){
		if(buff_cfg[i].intensify){
			count++
			this.buffs[i].destroy("dispel")
		}	
	}
	return count
}
//驱散一个增益状态
model.prototype.removeOneIntensify = function() {
	//状态BUFF刷新
	for(var i in this.buffs){
		if(buff_cfg[i].intensify){
			this.buffs[i].destroy("dispel")
			break
		}
	}
}
//驱散负面状态
model.prototype.removeDeBuff = function() {
	//负面状态
	if(!this.buffs["moyin"]){
		for(var i in this.buffs)
			if(buff_cfg[i].lower)
				this.buffs[i].destroy("dispel")
	}
	//控制效果
	for(var i in this.buffs)
		if(buff_cfg[i].control)
			this.buffs[i].destroy("dispel")
}
//获得负面状态数量
model.prototype.getDebuffNum = function() {
	var num = 0
	for(var i in this.buffs)
		if(buff_cfg[i].debuff)
			num++
		return num
}
//获得增益状态数量
model.prototype.getIntensifyNum = function() {
	var num = 0
	for(var i in this.buffs)
		if(buff_cfg[i].intensify)
			num++
		return num
}
//清除指定角色buff
model.prototype.clearReleaserBuff = function(releaser) {
	for(var i in this.buffs)
		if(buff_cfg[i].debuff &&this.buffs[i].releaser == releaser)
			this.buffs[i].destroy("clear")
}
//清除所有buff
model.prototype.diedClear = function() {
	if(this.buffs["ghost"]){
		for(var i in this.buffs){
			if(buff_cfg[i].debuff && buff_cfg[i].refreshType != "always")
				this.buffs[i].destroy()
		}
	}else{
		this.curAnger = 0
		for(var i in this.buffs){
			if(buff_cfg[i].refreshType != "always")
				this.buffs[i].destroy()
		}
	}
}
model.prototype.addFirstBuff = function(buff) {
	this.first_buff_list.push(buff)
}
model.prototype.addKillBuff = function(buffStr) {
	var buff = JSON.parse(buffStr)
	if(this.buffDuration)
		buff.duration += this.buffDuration
	this.kill_buffs[buff.buffId] = buff
}
model.prototype.addActionBuff = function(buffStr) {
	var buff = JSON.parse(buffStr)
	if(this.buffDuration)
		buff.duration += this.buffDuration
	this.action_buffs[buff.buffId] = buff
}
model.prototype.addDiedBuff = function(buffStr) {
	var buff = JSON.parse(buffStr)
	if(this.buffDuration)
		buff.duration += this.buffDuration
	this.died_buffs[buff.buffId] = buff
}
//闪避
model.prototype.onMiss = function() {
	if(this.shanbi_fanzhi)
		buffManager.createBuff(this,this,{buffId : "fanzhi",duration :2,buffArg : 1})
}
//受到伤害
model.prototype.onHit = function(attacker,info,callbacks) {
	info.id = this.id
	info.source = attacker.id
	info.value = Math.floor(info.value) || 1
	// if(this.died){
	// 	info.realValue = 0
	// 	return info
	// }
	if(this.buffs["ghost"]){
		info.value = 0
		info.realValue = 0
		info.curValue = this.attInfo.hp
		info.maxHP = this.attInfo.maxHP
		return info
	}
	if(this.gj_my && this.onAction){
		info.value = Math.floor(info.value * (1 - this.gj_my))
	}
	if(this.round_same_hit_red){
		if(!this.round_same_value[attacker.id])
			this.round_same_value[attacker.id] = 0
		this.round_same_value[attacker.id]++
	}
	//减伤判断
	if(info.d_type == "phy"){
		if(this.buffs["reduction"]){
			info.value = Math.floor(info.value * (1-this.buffs["reduction"]["value"]))
		}
	}else if(info.d_type == "mag"){
		if(this.buffs["reduction_mag"]){
			info.value = Math.floor(info.value * (1-this.buffs["reduction_mag"]["value"]))
		}
	}else{
		console.error("伤害类型错误",info)
	}
	if(!attacker.ignoreInvincible){
		//无敌吸血盾
		if(this.buffs["invincibleSuck"]){
			let healInfo = this.onHeal(this.buffs["invincibleSuck"].releaser,info)
			info.value = -info.value
			info.realValue = -healInfo.realValue
			info.curValue = this.attInfo.hp
			info.maxHP = this.attInfo.maxHP
			return info
		}
		//免疫
		if(this.buffs["invincibleSuper"] || this.buffs["invincible"]){
			info.invincible = true
			info.realValue = 0
			return info
		}
	}
	if(info.miss){
		info.realValue = 0
	}else{
		if(!attacker.ignore_shild && this.buffs["shield"]){
			info.value = this.buffs["shield"].offset(info.value)
			info.shield = true
		}
		if(this.buffs["protect"] && !this.buffs["protect"].releaser.died && callbacks){
			info.value = Math.floor(info.value/2)
			callbacks.push((function(){
				var tmpRecord = {type : "other_damage",value : info.value,d_type:info.d_type}
				tmpRecord = this.buffs["protect"].releaser.onHit(this,tmpRecord)
				fightRecord.push(tmpRecord)
			}).bind(this))
		}
		info.realValue = this.lessHP(info,callbacks)
		info.curValue = this.attInfo.hp
		info.maxHP = this.attInfo.maxHP
		if(this.damage_save)
			this.damage_save_value += info.realValue
		if(this.behit_amplify)
			this.behit_value += this.behit_amplify
		if(attacker && info.realValue > 0)
			attacker.totalDamage += info.realValue
		if(this.died){
			info.overflow = info.value - info.realValue
			info.kill = true
			if(callbacks){
				callbacks.push((function(){
					if(!attacker.died){
						attacker.kill(this)
					}
				}).bind(this))
			}
			if(callbacks){
				//受到直接伤害死亡时，对击杀自身的英雄造成最大生命值伤害
				if(this.died_maxHp_damage){
					callbacks.push((function(attacker,value){
						if(!attacker.died){
							fightRecord.push({type:"show_tag",id:this.id,tag:"died_maxHp_damage"})
							var tmpRecord = {type : "other_damage",value : value,d_type:"phy"}
							tmpRecord = attacker.onHit(this,tmpRecord)
							fightRecord.push(tmpRecord)
						}
					}).bind(this,attacker,Math.floor(attacker.attInfo.maxHP * this.died_maxHp_damage)))
				}
			}
		}else{
			if(!info.oneblood && info.seckillRate && !this.buffs["delay_death"] && !this.neglect_seckill && (this.attInfo.hp / this.attInfo.maxHP) < 0.15 && !this.isBoss){
				this.onDie(callbacks)
				info.seckill = true
				info.curValue = 0
				info.kill = true
				attacker.kill(this)
			}else{
				//callbacks存在时为直接伤害
				if(callbacks){
					//受到物理伤害时增加全队怒气
					if(info.d_type == "phy" && this.phy_turn_team_anger && this.phy_turn_value < this.phy_turn_team_anger){
						this.phy_turn_value++
						callbacks.push((function(){
							var targets = this.fighting.locator.getTargets(this,"team_all")
							if(targets.length){
								fightRecord.push({type:"show_tag",id:this.id,tag:"phy_turn_team_anger"})
								for(var i = 0;i < targets.length;i++){
									targets[i].addAnger(1)
								}
							}
						}).bind(this))
					}
					if((this.attInfo.hp / this.attInfo.maxHP < 0.5)){
						//生命值低于一半时触发无敌
						if(this.half_hp_immune){
							this.half_hp_immune = false
							callbacks.push((function(){
								fightRecord.push({type:"show_tag",id:this.id,tag:"half_hp_immune"})
								this.removeDeBuff()
								buffManager.createBuff(this,this,{buffId : "invincible",duration : 1})
							}).bind(this))
						}
						//生命值低于一半时触发吸收盾
						if(this.half_hp_shild && this.half_hp_shild_flag){
							this.half_hp_shild_flag = false
							callbacks.push((function(){
								fightRecord.push({type:"show_tag",id:this.id,tag:"half_hp_shild"})
								buffManager.createBuff(this,this,{buffId : "shield",buffArg : this.half_hp_shild,duration : 1})
							}).bind(this))
						}
					}
					//受到直接伤害时，伤害转化为伤害吸收盾附加给己方生命值最少的英雄
					if(this.damage_firend_shild){
						callbacks.push((function(value){
							var targets = this.fighting.locator.getTargets(this,"friend_minHp_1")
							if(targets[0]){
								fightRecord.push({type:"show_tag",id:this.id,tag:"damage_firend_shild"})
								buffManager.createBuff(this,targets[0],{buffId : "shield",buffArg : value,duration : 1,"number" : true})
							}
						}).bind(this,Math.floor(info.realValue * this.damage_firend_shild)))
					}
					//受到直接伤害时，额外行动
					if(this.onHit_extra_action && this.onHit_extra_flag){
						if(this.fighting.seeded.random("onHit_extra_action") < this.onHit_extra_action){
							this.onHit_extra_flag = false
							this.fighting.next_character.push(this)
							callbacks.push((function(){
								fightRecord.push({type:"show_tag",id:this.id,tag:"onHit_extra_action"})
							}).bind(this))
						}
					}
					//寒冰护盾
					if(this.buffs["cold_shield"]){
						if(this.fighting.seeded.random("cold_shield") < 0.3){
							callbacks.push((function(){
								buffManager.createBuff(this,attacker,{buffId : "cold",duration : 2})
							}).bind(this))
						}
					}
					//受到攻击后恢复生命值
					if(this.behit_heal){
						callbacks.push((function(){
							var tmpRecord = {type : "other_heal",targets : []}
							tmpRecord.targets.push(this.onHeal(this,{maxRate : this.behit_heal}))
							fightRecord.push(tmpRecord)
						}).bind(this))
					}
					if(this.buffs["frozen"]){
						callbacks.push((function(){
							if(this.buffs["frozen"])
								this.buffs["frozen"].onHit()
						}).bind(this))
					}
					if(this.buffs["burn_shield"]){
						if(this.fighting.seeded.random("burn_shield") < 0.3){
							callbacks.push((function(){
								buffManager.createBuff(this,attacker,{"buffId" : "burn","buffArg":0.2,"duration":2})
							}).bind(this))
						}
					}
					if(this.buffs["fengzheng"] && this.buffs["fengzheng"].releaser !== attacker){
						callbacks.push((function(){
							if(this.buffs["fengzheng"]){
								var tmpreleaser = this.buffs["fengzheng"].releaser
								this.buffs["fengzheng"].useBuff()
								skillManager.useSkill(tmpreleaser.defaultSkill,true,this)
							}
						}).bind(this))
					}
					if(this.ghost_atk_heal && attacker.buffs["ghost"]){
						callbacks.push((function(){
							var tmpRecord = {type : "other_heal",targets : []}
							tmpRecord.targets.push(this.onHeal(this,{maxRate : this.ghost_atk_heal}))
							fightRecord.push(tmpRecord)
						}).bind(this))
					}
					if(this.buffs["bingshen"]){
						if(this.fighting.seeded.random("bingshen") < 0.3){
							callbacks.push((function(){
								buffManager.createBuff(this,attacker,{"buffId" : "frozen","buffArg":1,"duration":2})
							}).bind(this))
						}
					}
					if(this.less_hp_rate && this.less_hp_buff && ((this.attInfo.hp / this.attInfo.maxHP) < this.less_hp_rate)){
						//生命值低于一定比例触发BUFF
						delete this.less_hp_rate
						callbacks.push((function(){
							buffManager.createBuff(this,this,{buffId : this.less_hp_buff})
							delete this.less_hp_buff
						}).bind(this))
					}
				}
			}
		}
	}
	// console.log(attacker.name + " 攻击 "+ this.name, info.value,"curHP : ",this.attInfo.hp+"/"+this.attInfo.maxHP)
	return info
}
//生命流失
model.prototype.onHPLoss = function() {
	var info = {type : "other_damage",id:this.id,"loss":true}
	info.value = Math.floor(this.maxHP_loss * this.attInfo.maxHP * this.fighting.round)
	if(info.value >= this.attInfo.hp){
		info.value = this.attInfo.hp - 1
	}
	info.realValue = this.lessHP(info)
	info.curValue = this.attInfo.hp
	info.maxHP = this.attInfo.maxHP
	fightRecord.push(info)
}
//受到治疗
model.prototype.onHeal = function(releaser,info) {
	if(this.buffs["soul_steal"] && !this.buffs["soul_steal"].releaser.buffs["soul_steal"]){
		return this.buffs["soul_steal"].releaser.onHeal(releaser,info)
	}
	if(this.died || this.buffs["ghost"]){
		info.value = 0
		info.maxRate = 0
	}
	info.id = this.id
	info.value = Math.floor(info.value) || 0
	info.maxRate = info.maxRate || 0
	info.value = Math.floor(info.value * (1 + this.attInfo.healAdd / 10000))
	if(info.maxRate)
		info.value += Math.floor(this.attInfo.maxHP * info.maxRate)
	if(this.buffs["forbidden"])
		info.value = Math.floor(info.value * 0.3)
	if(this.buffs["poison"])
		info.value = Math.floor(info.value * this.buffs["poison"].getValue())
	info.realValue = this.addHP(info.value)
	if(releaser && info.realValue > 0)
		releaser.totalHeal += info.realValue
	info.curValue = this.attInfo.hp
	info.maxHP = this.attInfo.maxHP
	return info
}
//永久增加属性
model.prototype.addAtt = function(name,value) {
	if(this.attInfo[name] != undefined){
		this.attInfo[name] += value
		fightRecord.push({type : "addAtt",name : name,value : value,id : this.id})
	}
}
//角色死亡
model.prototype.onDie = function(callbacks) {
	// console.log(this.name+"死亡")
	var callFlag = false
	if(!callbacks){
		callFlag = true
		callbacks = []
	}
	if(this.isPassive("died_buff")){
		var buff = JSON.parse(this.getPassiveArg("died_buff"))
		var targets = this.fighting.locator.getTargets(this,buff.buff_tg)
		if(targets.length){
			for(var i = 0;i < targets.length;i++){
				buffManager.createBuff(this,targets[i],buff)
			}
		}
	}
	if(this.buffs["delay_death"])
		return
	if(this.resurgence_team)
		delete this.teamInfo.resurgence_team
	this.attInfo.hp = 0
	this.died = true
	this.fighting.teamDiedList[this.belong].push(this.index)
	this.fighting.diedList.push(this)
	this.teamInfo["realms_survival"][this["realm"]]--
	for(var i = 0;i < this.team.length;i++)
		if(!this.team[i].died && this.team[i].id != this.id)
			this.team[i].friendDied(this,callbacks)
	if(callFlag){
		for(var i = 0;i < callbacks.length;i++)
			callbacks[i]()
	}
}
//队友死亡
model.prototype.friendDied = function(friend,callbacks){
	if(this.friend_died_count > 0 && this.friend_died_amp){
		fightRecord.push({type:"show_tag",id:this.id,tag:"friend_died_amp"})
		this.zf_amp += this.friend_died_amp
		this.friend_died_count--
	}
	if(this.passives["fh_ss"] && this.passives["fh_ss"].curCD == 0 && this.attInfo.hp / this.attInfo.maxHP > 0.3){
		var fh_ss_check = function() {
			if(friend.died && this.isPassive("fh_ss")){
				var rate = this.getPassiveArg("fh_ss")
				var info = {type : "other_damage",id:this.id,"loss":true}
				info.value = Math.floor(rate * this.attInfo.maxHP)
				info.realValue = this.lessHP(info)
				info.curValue = this.attInfo.hp
				info.maxHP = this.attInfo.maxHP
				fightRecord.push(info)
				friend.resurgence(info.realValue,this)
			}
		}
		callbacks.push(fh_ss_check.bind(this))
	}
	if(this.realmDiedSkill && this.realm == friend.realm && this.checkActionable()){
		callbacks.push((function(){
			skillManager.useSkill(this.angerSkill,true)
		}).bind(this))
	}
}
//击杀目标
model.prototype.kill = function(target) {
    // console.log(this.name+"击杀"+target.name)
    if(this.kill_buffs){
		for(var buffId in this.kill_buffs){
			var buff = this.kill_buffs[buffId]
			var buffTargets = this.fighting.locator.getBuffTargets(this,buff.buff_tg)
			var buffRate = buff.buffRate
			var buffArg = buff.buffArg
			var duration = buff.duration
			for(var i = 0;i < buffTargets.length;i++){
				if(buffTargets[i].died){
					continue
				}
				if(this.fighting.seeded.random("kill_buffs") < buffRate){
					buffManager.createBuff(this,buffTargets[i],{buffId : buffId,buffArg : buffArg,duration : duration})
				}
			}
		}
    }
    if(this.kill_ghost_dur){
    	this.kill_ghost_value++
    }
}
//复活
model.prototype.resurgence = function(rate,releaser) {
	if(this.buffs["jinhun"])
		return
	if(rate < 0)
		return
	if(rate > 1)
		this.attInfo.hp = Math.floor(rate)
	else
		this.attInfo.hp = Math.floor(rate * this.attInfo.maxHP) || 1
	this.died = false
	var index = this.fighting.arrayIndexOf(this.fighting.teamDiedList[this.belong],this.index)
    if(index > -1)
        this.fighting.teamDiedList[this.belong].splice(index, 1);
	this.teamInfo["realms_survival"][this["realm"]]++
	fightRecord.push({type : "resurgence",curValue : this.attInfo.hp,maxHP : this.attInfo.maxHP,id : this.id,curAnger : 0})
	if(releaser && releaser.rescue_anger)
		this.addAnger(releaser.rescue_anger)
	if(this.buffs["birth_fire"]){
		this.buffs["birth_fire"].destroy()
	}
}
//恢复血量
model.prototype.addHP = function(value) {
	var realValue = value
	if(!this.isBoss && (this.attInfo.hp + value) > this.attInfo.maxHP){
		realValue = this.attInfo.maxHP - this.attInfo.hp
		this.attInfo.hp = this.attInfo.maxHP
	}else{
		this.attInfo.hp += value
	}
	// console.log(this.name + "被治疗" , value,realValue,"curHP : ",this.attInfo.hp+"/"+this.attInfo.maxHP)
	return realValue
}
//扣除血量
model.prototype.lessHP = function(info,callbacks) {
	if(this.died || this.buffs["banish"]){
		return 0
	}
	var callFlag = false
	if(!callbacks){
		callFlag = true
		callbacks = []
	}
	if(this.half_hp_red && (this.round_damage >= (this.attInfo.maxHP / 2)))
		info.value = 1
	if(this.full_hp_red && this.attInfo.hp == this.attInfo.maxHP)
		info.value = Math.ceil(info.value * 0.5)
	info.realValue = info.value
	if((this.attInfo.hp - info.value) <= 0){
		if(this.full_hp_save && this.attInfo.hp == this.attInfo.maxHP){
			info.realValue = this.attInfo.hp - 1
			this.attInfo.hp = 1
			info.oneblood = true
		}else if(this.bm_fz){
			this.bm_fz = false
			info.realValue = this.attInfo.hp - 1
			this.attInfo.hp = 1
			info.oneblood = true
			callbacks.push((function(){
				buffManager.createBuff(this,this,{buffId : "banish",duration : 4})
			}).bind(this))
		}else if(this.oneblood_rate && this.fighting.seeded.random("判断BUFF命中率") < this.oneblood_rate){
			info.realValue = this.attInfo.hp - 1
			this.attInfo.hp = 1
			info.oneblood = true
		}else if(this.isPassive("bm_hx",callbacks)){
			info.oneblood = true
			this.attInfo.hp = Math.floor(this.attInfo.maxHP * 0.2)
		}else if(this.isPassive("bm_tx",callbacks)){
			info.oneblood = true
			this.attInfo.hp = 1
		}else if(this.isPassive("bm_wd",callbacks)){
			info.oneblood = true
			this.attInfo.hp = 1
			buffManager.createBuff(this,this,{buffId : "invincibleSuper",duration : 1})
		}else{
			this.attInfo.hp -= info.value
			this.onDie(callbacks)
		}
	}else{
		this.attInfo.hp -= info.value
	}
	this.round_damage += info.realValue
	if(callFlag){
		for(var i = 0;i < callbacks.length;i++)
			callbacks[i]()
	}
	return info.realValue
}
//恢复怒气
model.prototype.addAnger = function(value,hide) {
	if(this.buffs["banAnger"]){
		value = 0
		fightRecord.push({type : "addAnger",realValue : value,curAnger : this.curAnger,needAnger : this.needAnger,id : this.id,hide : hide,banAnger : true})
	}else{
		if(this.buffs["soul_steal"] && !this.buffs["soul_steal"].releaser.buffs["soul_steal"]  && this.buffs["soul_steal"].releaser.soul_steal_anger){
			return this.buffs["soul_steal"].releaser.addAnger(value,hide)
		}
		value = Math.floor(value) || 1
		this.curAnger += value
		fightRecord.push({type : "addAnger",realValue : value,curAnger : this.curAnger,needAnger : this.needAnger,id : this.id,hide : hide})
	}
	return value
}
//减少怒气
model.prototype.lessAnger = function(value,hide,use) {
	if(!use && this.banLessAnger){
		return 0
	}
	value = Math.floor(value) || 1
	var realValue = value
	if((this.curAnger - value) < 0){
		realValue = this.curAnger
		this.curAnger = 0
	}else{
		this.curAnger -= value
	}
	if(realValue)
		fightRecord.push({type : "lessAnger",realValue : realValue,curAnger : this.curAnger,needAnger : this.needAnger,id : this.id,hide : hide})
	return realValue
}
//检查连击技能
model.prototype.checkChaseSkill = function() {
	if(this.chaseFlag){
		return false
	}else{
		this.chaseFlag = true
		return true
	}
}
//获取属性
model.prototype.getTotalAtt = function(name) {
	var value = this.attInfo[name] || 0
	if(this.buffs[name]){
		value += this.buffs[name].getValue()
	}
	switch(name){
		case "speed":
			if(this.buffs["cold"])
				value += this.buffs["cold"].getValue()
			if(this.buffs["wind"])
				value += Math.floor(value * this.buffs["wind"].getValue() * 0.02)
		break
		case "atk":
			if(this.buffs["polang"])
				value += Math.floor(value * this.buffs["polang"].getValue() * 0.05)
			if(this.buffs["sand"] && this.buffs["sand"].releaser.sand_low_damage)
				value -= Math.floor(value * this.buffs["sand"].releaser.sand_low_damage)
			if(this.buffs["atkAdd"])
				value += this.buffs["atkAdd"].getValue()
			if(this.buffs["atkLess"])
				value -= this.buffs["atkLess"].getValue()
			if(this.buffs["wind"])
				value += Math.floor(value * this.buffs["wind"].getValue() * 0.03)
		break
		case "crit":
			if(this.buffs["polang"])
				value += this.buffs["polang"].getValue() * 0.05
			if(this.buffs["blood"])
				value += this.buffs["blood"].getValue()
			if(this.buffs["flame"])
				value += this.buffs["flame"].getValue() * 0.03
			if(this.buffs["kb_boss1"])
				value += 0.5
		break
		case "critDef":
			if(this.buffs["kb_boss2"])
				value += 0.5
		break
		case "slay":
			if(this.buffs["baonu"])
				value += 0.2
			if(this.buffs["kb_polang"])
				value += 0.3
			if(this.buffs["kb_boss1"])
				value += 0.5
		break
		case "hitRate":
			if(this.buffs["sand"] && this.buffs["sand"].releaser.sand_low_hit){
				value -= this.buffs["sand"].releaser.sand_low_hit
			}
		break
		case "dodgeRate":
			if(this.buffs["fanzhi"]){
				value += this.buffs["fanzhi"].getValue() * 0.05
			}
		break
		case "amplify":
			if(this.buffs["god_power"]){
				value += this.buffs["god_power"].getValue() * 0.15
			}
			if(this.buffs["weak"]){
				value -= this.buffs["weak"].getValue() * 0.15
			}
			if(this.buffs["ghost"] && this.ghost_amp)
				value += this.ghost_amp
			if(this.buffs["huosheng"])
				value += 0.3
			if(this.buffs["juexing"])
				value += 0.2
		break
		case "reduction":
			if(this.buffs["pojia"])
				value -= this.buffs["pojia"].getValue() * 0.12
			if(this.buffs["god_shield"])
				value += this.buffs["god_shield"].getValue() * 0.15
			if(this.buffs["frost"])
				value += this.buffs["frost"].getValue() * 0.05
			if(this.buffs["flame"])
				value += this.buffs["flame"].getValue() * 0.03
			if(this.buffs["protect"])
				value += 0.2
			if(this.buffs["bingshen"])
				value += 0.3
			if(this.buffs["kb_boss3"])
				value += 0.3
		break
		case "healRate":
			if(this.buffs["kb_boss4"])
				value += 1
		break
	}
	return value
}
//获取信息
model.prototype.getInfo = function() {
	var info = {}
	info.id = this.id
	info.nation = this.nation
	info.definition = this.definition
	info.index = this.index
	info.lv = this.lv
	info.maxHP = this.attInfo.maxHP
	info.hp = this.attInfo.hp
	info.atk = this.attInfo.atk
	info.phyDef = this.attInfo.phyDef
	info.magDef = this.attInfo.magDef
	info.speed = Math.floor(this.attInfo.speed)
	info.crit = this.attInfo.crit
	info.critDef = this.attInfo.critDef
	info.slay = this.attInfo.slay
	info.slayDef = this.attInfo.slayDef
	info.hitRate = this.attInfo.hitRate
	info.dodgeRate = this.attInfo.dodgeRate
	info.amplify = this.attInfo.amplify
	info.reduction = this.attInfo.reduction
	info.healRate = this.attInfo.healRate
	info.healAdd = this.attInfo.healAdd
	info.needAnger = this.needAnger
	info.curAnger = this.curAnger
	return info
}
model.prototype.getSimpleInfo = function() {
	var info = {}
	info.id = this.id
	info.lv = this.lv
	info.star = this.star
	info.ad = this.ad
	info.realm = this.realm
	info.atk = this.attInfo.atk
	info.maxHP = this.attInfo.maxHP
	info.hp = this.attInfo.hp
	info.speed = Math.floor(this.attInfo.speed)
	info.curAnger = this.curAnger
	info.needAnger = this.needAnger
	info.totalDamage = this.totalDamage
	info.totalHeal = this.totalHeal
	info.heroId = this.heroId
	info.M_HP = this.attInfo.M_HP
	info.M_ATK = this.attInfo.M_ATK
	info.M_DEF = this.attInfo.M_DEF
	info.M_STK = this.attInfo.M_STK
	info.M_SEF = this.attInfo.M_SEF
	info.M_SPE = this.attInfo.M_SPE
	return info
}
model.prototype.addBuff = function(releaser,buff) {
	if(this.buffs[buff.buffId]){
		this.buffs[buff.buffId].overlay(releaser,buff)
	}else{
		this.buffs[buff.buffId] = buff
	}
}
model.prototype.removeBuff = function(buffId) {
    if(this.buffs[buffId]){
        delete this.buffs[buffId]
    }
}
//判断被动技能是否生效
model.prototype.isPassive = function(id,callbacks) {
	if(this.passives[id] && this.passives[id].isUseable()){
		if(callbacks){
			callbacks.push(function(){
				fightRecord.push({type:"show_tag",id:this.id,tag:id})
			}.bind(this))
		}else{
			fightRecord.push({type:"show_tag",id:this.id,tag:id})
		}
		return true
	}else
		return false
}
//获取被动技能参数
model.prototype.getPassiveArg = function(id) {
	if(this.passives[id]){
		return this.passives[id].arg
	}else
		return 0
}
module.exports = model