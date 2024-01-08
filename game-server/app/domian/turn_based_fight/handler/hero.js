//英雄系统
const fightCfg = require("../fight/fightCfg.js")
const evolves = fightCfg.getCfg("evolves")
const hufu_lv = fightCfg.getCfg("hufu_lv")
const evolve_lv = fightCfg.getCfg("evolve_lv")
const exalt_lv = fightCfg.getCfg("exalt_lv")
const hero_quality = fightCfg.getCfg("hero_quality")
const heros = fightCfg.getCfg("heros")
const lv_cfg = fightCfg.getCfg("lv_cfg")
const hufu_skill = fightCfg.getCfg("hufu_skill")
const talent_list = fightCfg.getCfg("talent_list")
const aptitudes = fightCfg.getCfg("aptitude")
const skills = fightCfg.getCfg("skills")
const equip_suit = fightCfg.getCfg("equip_suit")
const gem_lv = fightCfg.getCfg("gem_lv")
const ace_pack = fightCfg.getCfg("ace_pack")
const guild_cfg = fightCfg.getCfg("guild_cfg")
const guild_skill = fightCfg.getCfg("guild_skill")
const manor_main = fightCfg.getCfg("manor_main")
const manor_type = fightCfg.getCfg("manor_type")
const hufu_quality = fightCfg.getCfg("hufu_quality")
const zhanfa = fightCfg.getCfg("zhanfa")
const DIY_hero = fightCfg.getCfg("DIY_hero")
const DIY_skills = fightCfg.getCfg("DIY_skills")
const DIY_talents = fightCfg.getCfg("DIY_talents")
const character = require("../entity/character.js")
const DIY_SKILL_KESY = ["DIY_N","DIY_S"]
const DIY_TALENT_KESY = ["D1","D2","D3","PS0","PS1","PS2","PS3","PS4"]
var gemMap = {}
for(var i in gem_lv){
	i = Number(i)
	for(var j = 1; j <= 7;j++){
		gemMap[gem_lv[i]["type_"+j]] = Object.assign({type : j},gem_lv[i])
		if(gem_lv[i+1])
			gemMap[gem_lv[i]["type_"+j]].next = gem_lv[i+1]["type_"+j]
	}
}
var lv4Map = []
for(var i in hufu_skill)
	lv4Map.push(hufu_skill[i]["lv4"])
var hufu_map = {}
for(var i in hufu_skill){
	for(var j = 1;j<= 5;j++){
		hufu_map[hufu_skill[i]["lv"+j]] = {"id":i,"lv":j}
	}
}
var gSkillAtts = {}
for(var i = 1;i <= 4;i++)
	gSkillAtts[i] = JSON.parse(guild_cfg["career_"+i]["value"])
var exaltMap = {}
for(var i in heros){
	if(!heros[i]["NPC"] && heros[i]["type"] == 0){
		if(!exaltMap[heros[i]["exalt"]])
			exaltMap[heros[i]["exalt"]] = []
		exaltMap[heros[i]["exalt"]].push(i)
	}
}
var model = function(fightContorl) {
	var local = {}
	//生成一个英雄
	this.makeHeroData = function(id,qa) {
		if(!heros[id])
			return {}
		var heroInfo = {}
		heroInfo.id = id
		heroInfo.evo = 1
		heroInfo.exalt = heros[id]["exalt"]
		heroInfo.qa = qa
		heroInfo.wash = 0
		heroInfo.lv = 1
		var c_info = this.createHero(heroInfo.id,heroInfo.qa,heroInfo.wash)
		Object.assign(heroInfo,c_info)
		return heroInfo
	}
	//获得满属性神兽
	this.makeFullHeroData = function(id) {
		if(!heros[id])
			return {}
		var heroInfo = {}
		heroInfo.id = id
		heroInfo.evo = 1
		heroInfo.exalt = heros[id]["exalt"]
		heroInfo.qa = 5
		heroInfo.wash = 0
		heroInfo.lv = 1
		for(var i = 1;i <= 6;i++)
			heroInfo["MR"+i] = 1
		for(var i = 0;i < heros[id]["passive_num"];i++)
			heroInfo["PS"+i] = heros[id]["passive"+(i+1)]
		return heroInfo
	}
	//生成最近携带等级的英雄
	this.makeHeroByLv = function(lv,qa) {
		var exaltId = 0
		for(var i in exalt_lv){
			if(lv >= exalt_lv[i]["limit"])
				exaltId = i
			else
				break
		}
		var id = exaltMap[exaltId][Math.floor(Math.random() * exaltMap[exaltId].length)]
		return this.makeHeroData(id,qa)
	}
	//获取基准战力英雄
	this.makeStandardHero = function(id,qa,lv,evo,main_rate) {
		if(!heros[id])
			return {}
		var heroInfo = {}
		heroInfo.id = id
		heroInfo.evo = evo
		heroInfo.exalt = heros[id]["exalt"]
		heroInfo.qa = qa
		heroInfo.lv = lv
		//主属性
		for(var i = 1;i <= 6;i++)
			heroInfo["MR"+i] = hero_quality[qa]["mainRate"] * main_rate
		//技能
		var skillNum = heros[id]["passive_num"]
		var skillList = []
		for(var i = 1; i <= skillNum;i++)
			skillList.push(heros[id]["passive"+i])
		for(var i = 0;i < skillList.length;i++)
			heroInfo["PS"+i] = skillList[i]
		return heroInfo
	}
	//获取进化概率
	this.getHeroEvoRate = function(heroInfo,herolist) {
		var need = evolve_lv[heroInfo["evo"]]["need"] * exalt_lv[heroInfo["exalt"]]["rate"]
		var cur = 0
		for(var i in herolist){
			var qaRate = 1
			if(heroInfo.id == herolist[i].id)
				qaRate *= 1.5
			qaRate *= hero_quality[herolist[i].qa]["rete"]
			cur += exalt_lv[herolist[i]["exalt"]]["basic"] * qaRate
		}
		var rate = cur/need
		if(heroInfo.evoRate)
			rate += Number(heroInfo.evoRate) || 0
		return Math.min(Number(rate.toFixed(2)),1)
	}
	//生成英雄资质
	this.createHero = function(id,qa,wash,item) {
		var c_info = {}
		var extra = 0
		var skillNum = 0
		c_info.wash = wash
		//宠物异化
		if(qa == 3 || qa == 4){
			if(Math.random() < exalt_lv[heros[id]["exalt"]]["wash_qa"+qa])
				qa++
		}
		c_info.qa = qa
		//触发资质加成
		if(item || Math.random() < wash/200)
			extra = 0.05
		//触发技能保底
		if(c_info.wash >= 100)
			skillNum = heros[id]["passive_num"]
		else
			skillNum = Math.floor(hero_quality[qa]["skillRate"] * (Math.random() * 0.5 + 0.6) * heros[id]["passive_num"])
		skillNum = Math.min(2,skillNum)
		for(var i = 1;i <= 6;i++)
			c_info["MR"+i] = Number((hero_quality[qa]["mainRate"] * (Math.random() * (0.4 + extra) + 0.6)).toFixed(2))
		if(skillNum == heros[id]["passive_num"])
			c_info.wash = 0
		var skillList = []
		for(var i = 1; i <= skillNum;i++)
			skillList.push(heros[id]["passive"+i])
		skillList.sort(function(){return Math.random() > 0.5 ? 1 : -1})
		for(var i = 0;i < skillList.length;i++)
			c_info["PS"+i] = skillList[i]
		//异化多一个超级技能
		if(c_info.qa == 5)
			c_info["PS"+skillNum] = lv4Map[Math.floor(lv4Map.length * Math.random())]
		return c_info
	}
	//获取英雄分解返还
	this.getHeroRecycle = function(list) {
		var strList = []
		var map = {"2000030":0,"2000050":0}
		for(var i = 0;i < list.length;i++){
			var id = list[i].id
			var lv = list[i].lv
			//等级返还
			if(lv_cfg[lv] && lv_cfg[lv].pr)
				strList.push(lv_cfg[lv].pr)
			//宝物返还
			for(var j = 0;j <= 10;j++){
				if(list[i]["a"+j])
					strList.push(list[i]["a"+j]+":1")
			}
			//宝石返还
			for(var j = 1;j <= 6;j++){
				for(var k = 1;k <= 5;k++)
				if(list[i]["e"+j+"g"+k])
					strList.push(list[i]["e"+j+"g"+k]+":1")
			}
			map["2000030"] += Math.round(evolve_lv[list[i]["evo"]]["pr"] * exalt_lv[list[i]["exalt"]]["prRate"])
			if(list[i]["qa"] >= 5)
				map["2000050"] += 1

		}
		var str = ""
		for(var i in map)
			if(map[i])
				str += i+":"+map[i]+"&"
		for(var i in strList)
			str += strList[i]+"&"
		str = str.substr(0,str.length-1)
		var awards = this.getHeroPrlvadnad(list)
		return {awardStr : str,awards:awards}
	}
	//英雄材料返还
	this.getHeroPrlvadnad = function(list) {
		var awards = []
		for(var i = 0;i < list.length;i++){
			//护符返还
			if(list[i]["hfLv"]){
				var hufuInfo = {lv:list[i]["hfLv"]}
				if(list[i]["hfs1"])
					hufuInfo.s1 = list[i]["hfs1"]
				if(list[i]["hfs2"])
					hufuInfo.s2 = list[i]["hfs2"]
				awards.push({type : "hufu",data : hufuInfo})
			}
			//装备返还
			for(var j = 1;j <= 6;j++)
				if(list[i]["e"+j])
					awards.push({type : "equip",data : list[i]["e"+j]})
			//法宝返还
			for(var j = 1;j <= 3;j++){
				if(list[i]["fabao"+j])
					awards.push({type : "fabao",data : list[i]["fabao"+j]})
			}
		}
		return awards
	}
	//获取英雄战力
	this.getHeroCE = function(info) {
		if(!info)
			return 0
		info = Object.assign({},info)
		var allCE = 0
		var evoId = evolve_lv[info.evo]["evoId"]
		var aptitude = exalt_lv[info.exalt]["aptitude"] || 1
		//主属性战力
		info["M_HP"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_HP"] * (info["MR1"] || 1))
		info["M_ATK"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_ATK"] * (info["MR2"] || 1))
		info["M_DEF"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_DEF"] * (info["MR3"] || 1))
		info["M_STK"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_STK"] * (info["MR4"] || 1))
		info["M_SEF"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_SEF"] * (info["MR5"] || 1))
		info["M_SPE"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_SPE"] * (info["MR6"] || 1))
		allCE += Math.floor((info["M_HP"]+info["M_ATK"]+info["M_DEF"]+info["M_STK"]+info["M_SEF"]+info["M_SPE"]) * 120 + aptitude * 1000)
		//技能战力
		for(var i = 0;i <= 10;i++)
			if(info["PS"+i])
				allCE += hufu_lv[hufu_map[info["PS"+i]].lv]["ce"]
		//等级战力
		if(info["lv"])
			allCE += lv_cfg[info["lv"]]["ce"]
		//宝物战力
		for(var j = 1;j <= 10;j++)
			if(info["a"+j])
				allCE += ace_pack[info["a"+j]]["ce"]
		//装备战力
		for(var j = 1;j <= 6;j++){
			if(info["e"+j])
    			allCE += this.getEquipCE(info["e"+j])
			//宝石战力
			for(var k = 1;k <= 5;k++){
				if(info["e"+j+"g"+k])
	    			allCE += gemMap[info["e"+j+"g"+k]]["ce"]
			}
		}
		//法宝战力
		for(var i = 1;i <= 3;i++){
			if(info["fabao"+i])
				allCE += this.getFabaoCE(info["fabao"+i])
		}
		//护符战力
		if(info["hfLv"] && hufu_quality[info["hfLv"]]){
			allCE += hufu_quality[info["hfLv"]]["ce"]
			if(info["hfs1"] && hufu_map[info["hfs1"]])
				allCE += hufu_lv[hufu_map[info["hfs1"]].lv]["ce"]
			if(info["hfs2"] && hufu_map[info["hfs2"]])
				allCE += hufu_lv[hufu_map[info["hfs2"]].lv]["ce"]
		}
		//战法战力
		for(var j = 1;j <= 3;j++){
			if(info["zf_"+j] && zhanfa[info["zf_"+j]])
    			allCE += zhanfa[info["zf_"+j]]["ce"]
		}
		return Math.ceil(allCE)
	}
	//获取角色数据
	this.getCharacterInfo = function(info,heroAtts,teamCfg) {
		if(!info || !heros[info.id])
			return false
		teamCfg = teamCfg || {}
		info = Object.assign({},info)
		info.heroAtts = heroAtts
		info.exalt = info.exalt || 1
		info.evo = info.evo || 1
		info.lv = info.lv || 1
		var id = info.id
		info.aptitude = exalt_lv[info.exalt]["aptitude"] || 1
		//神兽资质加成
		if(heros[id]["type"] == 2)
			info.aptitude += 3
		this.mergeData(info,heros[id])
		var evoId = evolve_lv[info.evo]["evoId"]
		if(!evolves[heros[info.id]["evo"+evoId]]){
			console.log("evoId error "+heros[info.id]["evo"+evoId]+"-"+info.id)
			return false
		}
		if(evolves[heros[info.id]["evo"+evoId]]["specie1"])
			info.specie1 = evolves[heros[info.id]["evo"+evoId]]["specie1"]
		if(evolves[heros[info.id]["evo"+evoId]]["specie2"])
			info.specie2 = evolves[heros[info.id]["evo"+evoId]]["specie2"]
		//天赋被动
		if(heros[id]["type"] == 3){
			//定制英雄
			if(info["DIY_N"])
				info["defaultSkill"] = info["DIY_N"]
			if(info["DIY_S"])
				info["angerSkill"] = info["DIY_S"]
			for(var i = 1;i <= evoId;i++)
				this.mergeTalent(info,info["D"+i])
		}else{
			for(var i = 1;i <= evoId;i++)
				this.mergeTalent(info,heros[info.id]["talent"+i])
		}
		//神兽技能
		if(info.m_ps)
			this.mergeTalent(info,heros[info.id]["mythical"])
		//主属性计算
		info["M_HP"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_HP"] * (info["MR1"] || 1))
		info["M_ATK"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_ATK"] * (info["MR2"] || 1))
		info["M_DEF"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_DEF"] * (info["MR3"] || 1))
		info["M_STK"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_STK"] * (info["MR4"] || 1))
		info["M_SEF"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_SEF"] * (info["MR5"] || 1))
		info["M_SPE"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_SPE"] * (info["MR6"] || 1))
		var lvInfo = {
		    "maxHP":aptitudes[info.aptitude].maxHP,
		    "atk": aptitudes[info.aptitude].atk,
		    "phyDef": aptitudes[info.aptitude].phyDef,
		    "magDef": aptitudes[info.aptitude].magDef
		}
		//等级计算
		if(info.lv && lv_cfg[info.lv]){
			var growth = aptitudes[info.aptitude].growth
			lvInfo.maxHP += Math.floor(lv_cfg[info.lv].maxHP * growth)
			lvInfo.atk += Math.floor(lv_cfg[info.lv].atk * growth)
			lvInfo.phyDef += Math.floor(lv_cfg[info.lv].phyDef * growth)
			lvInfo.magDef += Math.floor(lv_cfg[info.lv].magDef * growth)
			lvInfo.speed += lv_cfg[info.lv].speed
		}
		if(evolve_lv[info.evo]){
			lvInfo.maxHP += Math.floor(lvInfo.maxHP * evolve_lv[info.evo]["att_add"])
			lvInfo.atk += Math.floor(lvInfo.atk * evolve_lv[info.evo]["att_add"])
			lvInfo.phyDef += Math.floor(lvInfo.phyDef * evolve_lv[info.evo]["att_add"])
			lvInfo.magDef += Math.floor(lvInfo.magDef * evolve_lv[info.evo]["att_add"])
			lvInfo.speed += Math.floor(lvInfo.maxHP * evolve_lv[info.evo]["att_add"])
		}
		this.mergeData(info,lvInfo)
		//装备计算
		var suitMaps = {}
		for(var i = 1;i <= 6;i++){
			if(info["e"+i]){
				var eInfo = this.getEquipData(info["e"+i])
				this.mergeData(info,eInfo.mainAtt)
				this.mergeData(info,eInfo.extraAtt)
				this.mergeData(info,eInfo.stAtt)
				this.mergeData(info,eInfo.zfAtt)
				for(var j = 0;j < eInfo.spe.length;j++)
					this.mergeTalent(info,eInfo.spe[j])
				if(eInfo.suit){
					if(!suitMaps[eInfo.suit])
						suitMaps[eInfo.suit] = 0
					suitMaps[eInfo.suit]++
				}
				//宝石
				for(var k = 1;k <= 5;k++)
					if(info["e"+i+"g"+k])
						this.mergeTalent(info,info["e"+i+"g"+k])
			}
		}
		//装备套装
		for(var i in suitMaps){
			if(suitMaps[i] >= equip_suit[i]["count"])
				this.mergeTalent(info,i)
		}
		//宝物加成
		for(var i = 1;i <= 10;i++){
			if(info["a"+i]){
				var talentId = ace_pack[info["a"+i]]["pa"]
				this.mergeTalent(info,talentId)
			}
		}
		//法宝加成
		for(var i = 1;i <= 3;i++){
			if(info["fabao"+i]){
				var fabaoData = this.getFabaoData(info["fabao"+i])
				this.mergeData(info,fabaoData.realAtt)
				for(var j = 0;j < fabaoData.spe.length;j++)
					this.mergeTalent(info,fabaoData.spe[j])
				for(var j = 0;j < fabaoData.slotTalents.length;j++)
					this.mergeTalent(info,fabaoData.slotTalents[j])
			}
		}
		//公会技能计算
		if(teamCfg && teamCfg["g"+info.career] && gSkillAtts[info.career]){
			var glv = teamCfg["g"+info.career]
			var gInfo = {}
			for(var i = 0;i < gSkillAtts[info.career].length;i++){
				gInfo[gSkillAtts[info.career][i]] = guild_skill[glv]["pos_"+i]
			}
			this.mergeData(info,gInfo)
		}
		var hufu_talents = {}
		//护符计算
		if(info.hfLv){
			if(hufu_quality[info.hfLv])
				this.mergeData(info,{"self_atk_add" : hufu_quality[info.hfLv]["atk"],"self_maxHP_add" : hufu_quality[info.hfLv]["hp"]})
			if(info.hfs1){
				if(hufu_map[info.hfs1]){
					if(!hufu_talents[hufu_map[info.hfs1].id] || hufu_map[info.hfs1].lv > hufu_talents[hufu_map[info.hfs1].id])
						hufu_talents[hufu_map[info.hfs1].id] = hufu_map[info.hfs1].lv
				}
			}
			if(info.hfs2){
				if(hufu_map[info.hfs2]){
					if(!hufu_talents[hufu_map[info.hfs2].id] || hufu_map[info.hfs2].lv > hufu_talents[hufu_map[info.hfs2].id])
						hufu_talents[hufu_map[info.hfs2].id] = hufu_map[info.hfs2].lv
				}
			}
		}
		//被动技能
		var PSScore = 0
		for(var i = 0;i <= 10;i++){
			if(info["PS"+i]){
				if(hufu_map[info["PS"+i]]){
					if(!hufu_talents[hufu_map[info["PS"+i]].id] || hufu_map[info["PS"+i]].lv > hufu_talents[hufu_map[info["PS"+i]].id])
						hufu_talents[hufu_map[info["PS"+i]].id] = hufu_map[info["PS"+i]].lv
				}
				PSScore += hufu_lv[hufu_map[info["PS"+i]].lv]["score"]
			}
		}
		for(var i in hufu_talents)
			this.mergeTalent(info,hufu_skill[i]["lv"+hufu_talents[i]])
		//家园属性
		if(teamCfg["manors"]){
			for(var i = 1;i <= 6;i++){
				var key = "ATT_"+i
				if(teamCfg["manors"][key] && teamCfg["manors"]["slot_"+key]){
					for(var j = 0;j < teamCfg["manors"]["slot_"+key].length;j++){
						if(teamCfg["manors"]["slot_"+key][j] == info.hId && manor_main[teamCfg["manors"][key]]){
							var tmpInfo = {}
							tmpInfo[manor_type[key]["ATT"]] = manor_main[teamCfg["manors"][key]]["hero_att"]
							this.mergeData(info,tmpInfo)
							break
						}
					}
				}
			}
		}
		//===============场景属性=================//
		if(teamCfg["specieAdd"] && (info.specie1 == teamCfg["specieAdd"] || info.specie2 == teamCfg["specieAdd"]))
			this.mergeData(info,{"self_atk_add":0.5})
		//战法技能
		if(info.zf_1 && zhanfa[info.zf_1] && zhanfa[info.zf_1]["talent"])
			this.mergeTalent(info,zhanfa[info.zf_1]["talent"])
		if(info.zf_2 && zhanfa[info.zf_2] && zhanfa[info.zf_2]["talent"])
			this.mergeTalent(info,zhanfa[info.zf_2]["talent"])
		if(info.zf_3 && zhanfa[info.zf_3] && zhanfa[info.zf_3]["talent"])
			this.mergeTalent(info,zhanfa[info.zf_3]["talent"])
		//技能设置
		if(info.normal_change)
			info.defaultSkill = info.normal_change
		if(info.skill_change)
			info.angerSkill = info.skill_change
		if(info.defaultSkill){
			if(!skills[info.defaultSkill]){
				console.error("技能不存在",info.id,info.defaultSkill)
				info.defaultSkill = false
			}else{
				info.defaultSkill = Object.assign({skillId : info.defaultSkill},skills[info.defaultSkill])
			}
		}
		if(info.angerSkill){
			if(!skills[info.angerSkill]){
				console.error("技能不存在",info.id,info.angerSkill)
				info.angerSkill = false
			}else{
				info.angerSkill = Object.assign({skillId : info.angerSkill},skills[info.angerSkill])
			}
		}
		if(info.beginSkill && skills[info.beginSkill])
			info.beginSkill = Object.assign({skillId : info.beginSkill},skills[info.beginSkill])
		if(info.diedSkill && skills[info.diedSkill]){
			info.diedSkill = Object.assign({skillId : info.diedSkill},skills[info.diedSkill])
			info.diedSkill.diedSkill = true
		}
		//主属性增益
		info["maxHP"] += Math.floor((info["maxHP"] * (info["M_HP"]-40) / (info["M_HP"]+60)))
		info["score"] = Math.floor((info["M_HP"]+info["M_ATK"]+info["M_DEF"]+info["M_STK"]+info["M_SEF"]+info["M_SPE"]) * 28 + info.aptitude * 600 + PSScore)
		return new character(info)
	}
	//获取角色主数据
	this.getCharacterMainAtt = function(info) {
		if(!info || !heros[info.id])
			return false
		info = Object.assign({},info)
		info.exalt = info.exalt || 1
		info.evo = info.evo || 1
		info.lv = info.lv || 1
		var id = info.id
		var evoId = evolve_lv[info.evo]["evoId"]
		info.aptitude = exalt_lv[info.exalt]["aptitude"] || 1
		//神兽资质加成
		if(heros[id]["type"] == 2)
			info.aptitude += 3
		this.mergeData(info,heros[id])
		//主属性计算
		info["M_HP"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_HP"] * (info["MR1"] || 1))
		info["M_ATK"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_ATK"] * (info["MR2"] || 1))
		info["M_DEF"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_DEF"] * (info["MR3"] || 1))
		info["M_STK"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_STK"] * (info["MR4"] || 1))
		info["M_SEF"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_SEF"] * (info["MR5"] || 1))
		info["M_SPE"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_SPE"] * (info["MR6"] || 1))
		return info
	}
	//新增天赋
	this.mergeTalent = function(info,talentId,value) {
		if(!talent_list[talentId]){
			console.error("talentId error",talentId)
			return
		}
		for(var i = 1;i <= 6;i++){
			if(talent_list[talentId]["key"+i]){
				var tmpTalent = {}
				tmpTalent[talent_list[talentId]["key"+i]] = talent_list[talentId]["value"+i]
				if(tmpTalent[talent_list[talentId]["key"+i]] == "dynamic")
					tmpTalent[talent_list[talentId]["key"+i]] = value || 0
				this.mergeData(info,tmpTalent)
			}
		}
	}
	//数据合并
	this.mergeData = function(info1,info2) {
		if(!info2)
			return
		for(var i in info2){
			switch(i){
				case "normal_buff":
					if(!info1.normal_buffs)
						info1.normal_buffs = []
					info1.normal_buffs.push(info2[i])
				break
				case "skill_buff":
					if(!info1.skill_buffs)
						info1.skill_buffs = []
					info1.skill_buffs.push(info2[i])
				break
				case "round_buff":
					if(!info1.round_buffs)
						info1.round_buffs = []
					info1.round_buffs.push(info2[i])
				break
				case "first_buff":
					if(!info1.first_buffs)
						info1.first_buffs = []
					info1.first_buffs.push(info2[i])
				break
				case "action_buff":
					if(!info1.action_buffs)
						info1.action_buffs = []
					info1.action_buffs.push(info2[i])
				break
				case "kill_buff":
					if(!info1.kill_buffs)
						info1.kill_buffs = []
					info1.kill_buffs.push(info2[i])
				break
				case "died_buff":
					if(!info1.died_buffs)
						info1.died_buffs = []
					info1.died_buffs.push(info2[i])
				break
				default :
					if(info2[i]){
						if(info1[i] && Number.isFinite(info2[i])){
							if(Number.isFinite(info1[i])){
								info1[i] += info2[i]
							}else{
								info1[i] = info2[i]
							}
						}else{
							info1[i] = info2[i]
						}
					}
			}
		}
	}
	//计算战力差值
	this.calcCEDiff = function(name,oldValue,newValue) {
		var oldCE = 0
		var newCE = 0
		switch(name){
			case "e1":
			case "e2":
			case "e3":
			case "e4":
			case "e5":
			case "e6":
				oldCE = this.getEquipCE(oldValue)
				newCE = this.getEquipCE(newValue)
			break
			case "lv":
				oldCE = lv_cfg[oldValue || 1]["ce"] || 0
				newCE = lv_cfg[newValue || 1]["ce"] || 0
			break
			case "a1":
			case "a2":
			case "a3":
			case "a4":
			case "a5":
			case "a6":
			case "a7":
			case "a8":
			case "a9":
			case "a10":
				if(oldValue)
					oldCE = ace_pack[oldValue]["ce"] || 0
				if(newValue)
					newCE = ace_pack[newValue]["ce"] || 0
			break
			case "hfLv":
				if(oldValue)
					oldCE = hufu_quality[oldValue]["ce"] || 0
				if(newValue)
					newCE = hufu_quality[newValue]["ce"] || 0
			break 
			case "zf_1":
			case "zf_2":
			case "zf_3":
				if(oldValue && zhanfa[oldValue])
					oldCE = zhanfa[oldValue]["ce"] || 0
				if(newValue && zhanfa[newValue])
					newCE = zhanfa[newValue]["ce"] || 0
			break
			case "fabao1":
			case "fabao2":
			case "fabao3":
				oldCE = this.getFabaoCE(oldValue)
				newCE = this.getFabaoCE(newValue)
			break
			case "e1g1":
			case "e1g1":
			case "e1g2":
			case "e1g3":
			case "e1g4":
			case "e1g5":
			case "e2g1":
			case "e2g2":
			case "e2g3":
			case "e2g4":
			case "e2g5":
			case "e3g1":
			case "e3g2":
			case "e3g3":
			case "e3g4":
			case "e3g5":
			case "e4g1":
			case "e4g2":
			case "e4g3":
			case "e4g4":
			case "e4g5":
			case "e5g1":
			case "e5g2":
			case "e5g3":
			case "e5g4":
			case "e5g5":
			case "e6g1":
			case "e6g2":
			case "e6g3":
			case "e6g4":
			case "e6g5":
				if(oldValue && gemMap[oldValue])
					oldCE = gemMap[oldValue]["ce"] || 0
				if(newValue && gemMap[newValue])
					newCE = gemMap[newValue]["ce"] || 0
			break
		}
		return newCE - oldCE
	}
	//生成定制英雄
	this.gainDIYHero = function(id,args) {
		if(!DIY_hero[id])
			return false
		args = args || {}
		var info = {}
		var heroInfo = this.makeStandardHero(id,DIY_hero[id].qa,1,1,1)
		info.price = DIY_hero[id]["price"]
		info.type = DIY_hero[id]["type"]
		for(var i = 0;i < DIY_SKILL_KESY.length;i++){
			if(args[DIY_SKILL_KESY[i]]){
				var tid = DIY_hero[id][DIY_SKILL_KESY[i]][args[DIY_SKILL_KESY[i]][0]]
				var sid = DIY_skills[tid]["list"][args[DIY_SKILL_KESY[i]][1]]
				info.price += DIY_skills[tid]["price"]
				heroInfo[DIY_SKILL_KESY[i]] = sid
			}
		}
		for(var i = 0;i < DIY_TALENT_KESY.length;i++){
			if(args[DIY_TALENT_KESY[i]]){
				var tid = DIY_hero[id][DIY_TALENT_KESY[i]][args[DIY_TALENT_KESY[i]][0]]
				var sid = DIY_talents[tid]["list"][args[DIY_TALENT_KESY[i]][1]]
				info.price += DIY_talents[tid]["price"]
				heroInfo[DIY_TALENT_KESY[i]] = sid
			}
		}
		info.heroInfo = heroInfo
		return info
	}
}
module.exports = model