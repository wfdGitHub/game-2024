var skillManager = require("../skill/skillManager.js")
var fightRecord = require("../fight/fightRecord.js")
var buffManager = require("../buff/buffManager.js")
var buff_cfg = require("../../../../config/gameCfg/buff_cfg.json")
var model = function(otps) {
	//=========身份===========//
	this.name = otps.name		//角色名称
	this.heroId = Number(otps.id)
	this.realm = otps.realm		//国家
	this.career = otps.career	//角色职业   healer 治疗者
	this.sex = otps.sex 		//性别 1男 2女
	this.index = 0				//所在位置
	this.isNaN = false			//是否空位置
	this.team = []				//所在阵容
	this.enemy = []				//敌对阵容
	this.lv = otps["lv"] || 1		//等级
	this.star = otps["star"] || 1		//星级
	this.ad = otps["ad"] || 0			//阶级
	this.teamInfo = {}
	this.bookAtts = otps.bookAtts
	this.isBoss = otps.boss || false	//是否是BOSS
	this.isAction = false 				//行动标识
	//=========基础属性=======//
	this.attInfo = {}
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

	this.attInfo.hp = this.attInfo.maxHP				//当前生命值
	this.surplus_health = otps.surplus_health			//剩余生命值比例

	this.needAnger = otps["needAnger"] || 4				//技能所需怒气值
	this.curAnger = (otps["curAnger"] || 0) + 2	//当前怒气值
	this.allAnger = otps["allAnger"] || false   //技能消耗所有怒气
	this.anyAnger = otps["anyAnger"] || false   //当前怒气小于4点时，也能施放技能，技能伤害降低15%*(4-当前怒气值)
	this.totalDamage = 0						//累计伤害
	this.totalHeal = 0							//累计治疗
	//=========新战斗属性=======//
	this.kill_buffs = {}

	this.tmpAmp = 0 										//临时伤害加成
	this.recover_settle = otps.recover_settle || false 		//释放持续恢复效果时，若目标身上已存在治疗效果，则立即结算原效果剩余回合数
	this.buffDuration = otps.buffDuration || 0 				//buff回合数增加
	this.remove_one_lower= otps.remove_one_lower || false   //行动前移除一个减益效果
	this.cold_hit_anger = otps.cold_hit_anger || 0 			//被寒冷状态下的敌人攻击时恢复怒气
	this.skill_again = otps.skill_again || 0 				//释放技能后再次释放概率
	this.add_anger_maxHp = otps.add_anger_maxHp || 0 		//追加技能伤害加成
	this.kill_buff1 = otps.kill_buff1 						//击杀后触发buff1
	this.kill_buff2 = otps.kill_buff2 						//击杀后触发buff2
	this.thawing_frozen = otps.thawing_frozen || 0 			//破冰一击伤害加成
	this.polang_heal = otps.polang_heal || 0 				//破浪每层回血
	this.polang_power = otps.polang_power || 0 				//破浪每层最大生命值伤害
	this.skill_anger_maxAtk = otps.skill_anger_maxAtk || 0 
	this.seckill = otps.seckill || false 					//释放技能时生命值低时秒杀

	//=========其他效果=======//
	this.first_buff_list = []			//初始BUFF
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
	this.died_resurgence = otps.died_resurgence || false  		//战斗中首次死亡时复活，并恢复全部血量
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
	this.front_critDef = otps["front_critDef"]  		//位于前排时抗暴加成
	this.front_maxHP = otps["front_maxHP"]  			//位于前排时血量加成
	this.front_dodgeRate = otps["front_dodgeRate"]  	//位于前排时闪避加成
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
	if(otps.died_team_buff)
		this.died_team_buff	= JSON.parse(otps.died_team_buff) || false 	//死亡时触发全队BUFF
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
	if(otps.died_buff_s)
		this.died_buff_s = JSON.parse(otps.died_buff_s) || false //死亡时释放BUFF
	if(otps.before_buff_s)
		this.first_buff_list.push(JSON.parse(otps.before_buff_s)) //战斗前对自身释放BUFF
	if(otps.action_buff_s)
		this.action_buff_s = JSON.parse(otps.action_buff_s) || false //行动后对自身释放BUFF
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
	if(otps.skill_later_skill){
		this.skill_later_skill = JSON.parse(otps.skill_later_skill)	//释放技能后后追加技能
	}

	this.hit_turn_rate = otps.hit_turn_rate || 0	//受到直接伤害转化成生命值百分比
	this.hit_turn_tg = otps.hit_turn_tg || 0		//受到直接伤害转化的生命值作用目标
	this.hit_rebound = otps.hit_rebound || 0		//受到直接伤害反弹比例

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
	if(otps.action_buff){
		this.action_buff = JSON.parse(otps.action_buff)		//行动后追加buff
	}

	this.low_hp_amp = otps.low_hp_amp || 0					//战斗中自身生命每降低10%，伤害加成
	this.low_hp_crit = otps.low_hp_crit || 0				//战斗中自身生命每降低10%，暴击加成
	this.low_hp_dodge = otps.low_hp_dodge || 0				//战斗中自身生命每降低10%，闪避加成
	this.low_hp_heal = otps.low_hp_heal || 0				//目标血量每减少10%，对其造成的的治疗量加成
	this.enemy_died_amp = otps.enemy_died_amp || 0			//敌方每阵亡一人，伤害加成比例

	this.single_less_anger = otps.single_less_anger || 0 	//攻击单体目标额外降低怒气
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
	if(otps.first_buff)
		this.first_buff_list.push(JSON.parse(otps.first_buff))	//首回合附加BUFF
	this.died_use_skill = otps.died_use_skill				//死亡时释放一次技能
	this.died_burn_buff_must = otps.died_burn_buff_must 	//死亡释放buff时必定命中
	if(otps.died_later_buff)
		this.died_later_buff = JSON.parse(otps.died_later_buff)	//直接伤害死亡时对击杀者释放buff
	this.maxHP_damage = otps.maxHP_damage || 0					//技能附加最大生命值真实伤害
	this.maxHP_rate = otps.maxHP_rate							//进入战斗时最大生命加成倍数
	this.maxHP_loss = otps.maxHP_loss							//每回合生命流失率
	this.round_amplify = otps.round_amplify || 0				//每回合伤害加成
	this.behit_amplify = otps.behit_amplify || 0 				//本回合中每受到一次伤害，下回合攻击伤害加成
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
	if(otps.defaultSkill)
		this.defaultSkill = skillManager.createSkill(otps.defaultSkill,this)				//普通技能
	if(otps.angerSkill){
		this.angerSkill = skillManager.createSkill(otps.angerSkill,this)		//怒气技能
		this.angerSkill.isAnger = true
		if(this.skill_heal_maxHp)
			this.angerSkill.self_heal = this.skill_heal_maxHp
	}
	if(otps.skill_buff1)
		this.angerSkill.addBuff(otps.skill_buff1)				//技能buff1
	if(otps.skill_buff2)
		this.angerSkill.addBuff(otps.skill_buff2)				//技能buff2
	if(otps.skill_buff3)
		this.angerSkill.addBuff(otps.skill_buff3)				//技能buff3
	if(otps.normal_buff1)
		this.defaultSkill.addBuff(otps.normal_buff1) 			//普攻buff1
	if(otps.normal_buff2)
		this.defaultSkill.addBuff(otps.normal_buff2) 			//普攻buff2
	if(otps.normal_buff3)
		this.defaultSkill.addBuff(otps.normal_buff3) 			//普攻buff3
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
	if(this.kill_buff1)
		this.addKillBuff(this.kill_buff1)
	if(this.kill_buff2)
		this.addKillBuff(this.kill_buff2)
	if(this.seckill)
		this.angerSkill.seckill = true
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
				this.attInfo[i] += Math.ceil(this.attInfo[i] * this.show_adds[i])
			break
			case "curAnger":
				this.curAnger += this.show_adds[i]
			break
			default:
				this.attInfo[i] += this.show_adds[i]
		}
	}
	for(var i in this.bookAtts){
		this.attInfo[i] += this.bookAtts[i]
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
	}
}
//战斗开始
model.prototype.begin = function() {
	if(this.maxHP_rate)
		this.attInfo.maxHP = Math.floor(this.attInfo.maxHP * this.maxHP_rate)
	this.attInfo.hp = this.attInfo.maxHP
	if(this.isBoss){
		this.attInfo.hp = 999999999
	}
	if(this.surplus_health === 0){
		this.attInfo.hp = 0
		this.died = true
	}else if(this.surplus_health){
		this.attInfo.hp = Math.ceil(this.attInfo.hp * this.surplus_health)
	}
}
//行动开始前刷新
model.prototype.before = function() {
	this.action_flag = true
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
}
//行动结束后刷新
model.prototype.after = function() {
	//状态BUFF刷新
	for(var i in this.buffs)
		if(buff_cfg[i].refreshType == "after")
			this.buffs[i].update()
	if(this.maxHP_loss > 0){
		this.onHPLoss()
	}
	this.damage_save_value = 0
}
//整体回合结束
model.prototype.roundOver = function() {
	if(this.died)
		return
	//状态BUFF刷新
	for(var i in this.buffs)
		if(buff_cfg[i].refreshType == "roundOver")
			this.buffs[i].update()
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
	var count = 0
	//状态BUFF刷新
	for(var i in this.buffs){
		if(buff_cfg[i].debuff && !buff_cfg[i].control){
			count++
			this.buffs[i].destroy("clear")
		}
	}
	return count
}
//解除一个减益状态
model.prototype.removeOneLower = function() {
	for(var i in this.buffs){
		if(buff_cfg[i].lower){
			this.buffs[i].destroy("clear")
			break
		}
	}
}
//驱散增益状态
model.prototype.removeIntensifyBuff = function() {
	//状态BUFF刷新
	for(var i in this.buffs)
		if(buff_cfg[i].intensify)
			this.buffs[i].destroy("dispel")
}
//驱散负面状态
model.prototype.removeDeBuff = function() {
	//状态BUFF刷新
	for(var i in this.buffs)
		if(buff_cfg[i].debuff)
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
	this.curAnger = 0
	for(var i in this.buffs)
		this.buffs[i].destroy()
}
model.prototype.addKillBuff = function(buffStr) {
	var buff = JSON.parse(buffStr)
	this.kill_buffs[buff.buffId] = buff
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
		info.realValue = this.lessHP(info)
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
			if(info.seckillRate && !this.neglect_seckill && (this.attInfo.hp / this.attInfo.maxHP) < 0.15){
				this.onDie()
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
						if(this.fighting.seeded.random("cold_shield") < 0.5){
							callbacks.push((function(){
								buffManager.createBuff(this,attacker,{buffId : "cold",duration : 2})
							}).bind(this))
						}
					}
					if(this.buffs["frozen"])
						this.buffs["frozen"].onHit()
					if(this.buffs["burn_shield"]){
						if(this.fighting.seeded.random("burn_shield") < 0.3){
							callbacks.push((function(){
								buffManager.createBuff(this,attacker,{"buffId" : "burn","buffArg":0.2,"duration":2})
							}).bind(this))
						}
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
	info.id = this.id
	info.value = Math.floor(info.value) || 0
	info.maxRate = info.maxRate || 0
	info.value = Math.floor(info.value * (1 + this.attInfo.healAdd / 10000))
	if(info.maxRate)
		info.value += Math.floor(this.attInfo.maxHP * info.maxRate)
	if(this.buffs["forbidden"])
		info.value = Math.floor(info.value * 0.3)
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
model.prototype.onDie = function() {
	// console.log(this.name+"死亡")
	if(this.resurgence_team)
		delete this.teamInfo.resurgence_team
	this.attInfo.hp = 0
	this.died = true
	this.fighting.diedList.push(this)
	for(var i = 0;i < this.team.length;i++)
		if(!this.team[i].died && this.team[i].id != this.id)
			this.team[i].friendDied(this)
}
//队友死亡
model.prototype.friendDied = function(friend){
	if(this.friend_died_count > 0 && this.friend_died_amp){
		fightRecord.push({type:"show_tag",id:this.id,tag:"friend_died_amp"})
		this.zf_amp += this.friend_died_amp
		this.friend_died_count--
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
					break
				}
				if(this.fighting.seeded.random("kill_buffs") < buffRate){
					buffManager.createBuff(this,buffTargets[i],{buffId : buffId,buffArg : buffArg,duration : duration})
				}
			}
		}
    }
}
//复活
model.prototype.resurgence = function(rate) {
	this.attInfo.hp = Math.floor(rate * this.attInfo.maxHP) || 1
	this.died = false
	fightRecord.push({type : "resurgence",curValue : this.attInfo.hp,maxHP : this.attInfo.maxHP,id : this.id,curAnger : 0})
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
model.prototype.lessHP = function(info) {
	if(this.died){
		return 0
	}
	if(this.half_hp_red && (this.round_damage >= (this.attInfo.maxHP / 2))){
		info.value = 1
	}
	info.realValue = info.value
	if((this.attInfo.hp - info.value) <= 0){
		if(this.oneblood_rate && this.fighting.seeded.random("判断BUFF命中率") < this.oneblood_rate){
			info.realValue = this.attInfo.hp - 1
			this.attInfo.hp = 1
			info.oneblood = true
		}else{
			info.realValue = this.attInfo.hp
			this.onDie()
		}
	}else{
		this.attInfo.hp -= info.value
	}
	this.round_damage += info.realValue
	return info.realValue
}
//恢复怒气
model.prototype.addAnger = function(value,hide) {
	if(this.buffs["banAnger"]){
		value = 0
		fightRecord.push({type : "addAnger",realValue : value,curAnger : this.curAnger,needAnger : this.needAnger,id : this.id,hide : hide,banAnger : true})
	}else{
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
		break
		case "atk":
			if(this.buffs["polang"])
				value += Math.floor(value * this.buffs["polang"].getValue() * 0.05)
		break
		case "crit":
			if(this.buffs["polang"])
				value += this.buffs["polang"].getValue() * 0.05
		break
		case "slay":
			if(this.buffs["baonu"])
				value += 0.2
		break
	}
	return value
}
//获取信息
model.prototype.getInfo = function() {
	var info = {}
	info.id = this.id
	info.name = this.name
	info.nation = this.nation
	info.definition = this.definition
	info.index = this.index
	info.lv = this.lv
	info.maxHP = this.attInfo.maxHP
	info.hp = this.attInfo.hp
	info.atk = this.attInfo.atk
	info.phyDef = this.attInfo.phyDef
	info.magDef = this.attInfo.magDef
	info.speed = this.attInfo.speed
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
	info.name = this.name
	info.realm = this.realm
	info.atk = this.attInfo.atk
	info.maxHP = this.attInfo.maxHP
	info.hp = this.attInfo.hp
	info.speed = this.speed
	info.curAnger = this.curAnger
	info.needAnger = this.needAnger
	info.totalDamage = this.totalDamage
	info.totalHeal = this.totalHeal
	info.heroId = this.heroId
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
module.exports = model