//英雄系统
const fightCfg = require("../fight/fightCfg.js")
const artifact_level = fightCfg.getCfg("artifact_level")
const stone_base = fightCfg.getCfg("stone_base")
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
const character = require("../entity/character.js")
const baseStone = {"1" : 4110,"2" : 4210,"3" : 4310,"4" : 4410}
var lv4Map = []
for(var i in hufu_skill)
	lv4Map.push(hufu_skill[i]["lv4"])
var hufu_map = {}
for(var i in hufu_skill){
	for(var j = 1;j<= 5;j++){
		hufu_map[hufu_skill[i]["lv"+j]] = {"id":i,"lv":j}
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
		var needRate = wash/300
		if(needRate)
			needRate += 0.2
		if(qa == 4 && Math.random() < needRate)
			qa = 5
		c_info.qa = qa
		//触发资质加成
		if(item || Math.random() < wash/200)
			extra = 0.05
		//触发技能保底
		if(c_info.wash >= 100)
			skillNum = heros[id]["passive_num"]
		else
			skillNum = Math.floor(hero_quality[qa]["skillRate"] * (Math.random() * 0.5 + 0.6) * heros[id]["passive_num"])
		for(var i = 1;i <= 6;i++)
			c_info["MR"+i] = hero_quality[qa]["mainRate"] * (Math.random() * (0.4 + extra) + 0.7)
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
			map["2000030"] += Math.round(evolve_lv[list[i]["evo"]]["pr"] * exalt_lv[list[i]["lv"]]["prRate"])
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
			var lv = list[i].lv
			//等级返还
			if(lv_cfg[lv] && lv_cfg[lv].pr)
				strList.push(lv_cfg[lv].pr)
			//宝物返还
			for(var j = 0;j <= 10;j++){
				if(list[i]["a"+j])
					strList.push(list[i]["a"+j]+":1")
			}
			var artifact = list[i].artifact
			//专属返还
			if(artifact !== undefined && artifact_level[artifact])
				strList.push(artifact_level[artifact]["pr"])
			//宝石返还
			for(var j = 1;j <= 8;j++){
				var key = "s"+j
				if(list[i][key]){
					//拆卸宝石
					strList.push(list[i][key]+":1")
					if(list[i][key+"v"] && stone_base[list[i][key]]){
						var num = Math.floor(list[i][key+"v"] / stone_base[baseStone[j]]["value"])
						strList.push(baseStone[j]+":"+num)
					}
				}
			}
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
		}
		return awards
	}
	//获取英雄战力
	this.getHeroCE = function(info) {
		if(!info)
			return 0
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
		//专属战力
		if(info["artifact"] !== undefined)
			allCE += artifact_level[info["artifact"]]["ce"]
		//宝物战力
		for(var j = 1;j <= 10;j++)
			if(info["a"+j])
				allCE += ace_pack[info["a"+j]]["ce"]
		//装备战力
		for(var j = 1;j <= 4;j++){
			if(info["e"+j])
    			allCE += this.getEquipCE(info["e"+j])
		}
		//宝石战力
		for(var j = 1;j <= 4;j++){
			if(info["s"+j] && stone_base[info["s"+j]])
    			allCE += stone_base[info["s"+j]]["ce"]
		}
		//技能宝石
		for(var j = 5;j <= 8;j++){
			if(info["s"+j] && stone_skill[info["s"+j]])
    			allCE += stone_skill[info["s"+j]]["ce"]
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
		info = Object.assign({},info)
		info.heroAtts = heroAtts
		info.exalt = info.exalt || 1
		info.evo = info.evo || 1
		info.lv = info.lv || 1
		var id = info.id
		var aptitude = exalt_lv[info.exalt]["aptitude"] || 1
		this.mergeData(info,heros[id])
		var evoId = evolve_lv[info.evo]["evoId"]
		if(evolves[heros[info.id]["evo"+evoId]]["specie1"])
			info.specie1 = evolves[heros[info.id]["evo"+evoId]]["specie1"]
		if(evolves[heros[info.id]["evo"+evoId]]["specie2"])
			info.specie2 = evolves[heros[info.id]["evo"+evoId]]["specie2"]
		//被动技能
		for(var i = 1;i <= evoId;i++)
			this.mergeTalent(info,heros[info.id]["talent"+evoId])
		//初始属性
		var lvInfo = {
		    "maxHP":aptitudes[aptitude].maxHP,
		    "atk": aptitudes[aptitude].atk,
		    "phyDef": aptitudes[aptitude].phyDef,
		    "magDef": aptitudes[aptitude].magDef
		}
		//等级计算
		if(info.lv && lv_cfg[info.lv]){
			var growth = aptitudes[aptitude].growth
			lvInfo.maxHP += Math.floor(lv_cfg[info.lv].maxHP * growth)
			lvInfo.atk += Math.floor(lv_cfg[info.lv].atk * growth)
			lvInfo.phyDef += Math.floor(lv_cfg[info.lv].phyDef * growth)
			lvInfo.magDef += Math.floor(lv_cfg[info.lv].magDef * growth)
			lvInfo.speed += lv_cfg[info.lv].speed
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
		//神兵加成
		if(info["artifact"] !== undefined){
			var artifact = info["artifact"]
			var lvInfo = {
			    "maxHP": artifact_level[artifact].maxHP,
			    "atk": artifact_level[artifact].atk,
			    "phyDef": artifact_level[artifact].phyDef,
			    "magDef": artifact_level[artifact].magDef,
			    "speed" : artifact_level[artifact].speed
			}
			this.mergeData(info,lvInfo)
			for(var i = 0;i <= artifact;i++){
				if(artifact_level[i].talent){
					var talentId = artifact_level[i].talent
					this.mergeTalent(info,talentId)
				}
			}
			if(artifact >= 25){
				if(artifact_talent[info.id]){
					var talentId = artifact_talent[info.id].talent
					this.mergeTalent(info,talentId)
				}
			}
		}
		//属性宝石加成
		var stonebaseInfo = {}
		for(var i = 1;i <= 4;i++){
			if(info["s"+i] && stone_base[info["s"+i]]){
				stonebaseInfo[stone_base[info["s"+i]]["key"]] = stone_base[info["s"+i]]["arg"]
			}
		}
		this.mergeData(info,stonebaseInfo)
		//技能宝石加成
		var stoneskillInfo = {}
		for(var i = 5;i <= 8;i++){
			if(info["s"+i] && stone_skill[info["s"+i]]){
				stoneskillInfo[stone_skill[info["s"+i]]["key"]] = stone_skill[info["s"+i]]["arg"]
			}
		}
		this.mergeData(info,stoneskillInfo)
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
		//建筑属性
		if(teamCfg && teamCfg["gjy"])
			this.mergeData(info,{"self_atk_add":manor_gjy[teamCfg["gjy"]]["add"]})
		if(teamCfg && teamCfg["dby"])
			this.mergeData(info,{"self_maxHP_add":manor_dby[teamCfg["dby"]]["add"]})
		if(teamCfg && teamCfg["qby"])
			this.mergeData(info,{"speed":manor_qby[teamCfg["qby"]]["add"]})
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
		//主属性计算
		info["M_HP"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_HP"] * (info["MR1"] || 1))
		info["M_ATK"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_ATK"] * (info["MR2"] || 1))
		info["M_DEF"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_DEF"] * (info["MR3"] || 1))
		info["M_STK"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_STK"] * (info["MR4"] || 1))
		info["M_SEF"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_SEF"] * (info["MR5"] || 1))
		info["M_SPE"] = Math.floor(evolves[heros[info.id]["evo"+evoId]]["M_SPE"] * (info["MR6"] || 1))
		//主属性增益
		info["maxHP"] += Math.floor((info["maxHP"] * (info["M_HP"]-40) / (info["M_HP"]+60)))
		info["score"] = Math.floor((info["M_HP"]+info["M_ATK"]+info["M_DEF"]+info["M_STK"]+info["M_SEF"]+info["M_SPE"]) * 28 + aptitude * 600 + PSScore)
		return new character(info)
	}
	//新增天赋
	this.mergeTalent = function(info,talentId,value) {
		if(talent_list[talentId]){
			let tmpTalent = {}
			for(var i = 1;i <= 2;i++){
				if(talent_list[talentId]["key"+i]){
					tmpTalent[talent_list[talentId]["key"+i]] = talent_list[talentId]["value"+i]
					if(tmpTalent[talent_list[talentId]["key"+i]] == "dynamic")
						tmpTalent[talent_list[talentId]["key"+i]] = value || 0
				}
			}
			this.mergeData(info,tmpTalent)
		}else{
			console.error("talentId error",talentId)
		}
	}
	//数据合并
	this.mergeData = function(info1,info2) {
		if(!info2)
			return
		for(var i in info2){
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
module.exports = model