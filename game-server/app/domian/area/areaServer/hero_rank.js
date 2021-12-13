//英雄排名
var maxNum = 20
module.exports = function() {
	var self = this
	//更新英雄战力
	self.update_heroRank = function(uid,heroId,hId,ce) {
		var str = "heroRank:"+heroId
		var key = uid+"_"+hId
		self.addZset(str,key,ce,function() {
			self.zremrangebyrank(str,maxNum)
		})
	}
	//删除英雄战力
	self.remove_heroRank = function(uid,heroId,hId) {
		var str = "heroRank:"+heroId
		var key = uid+"_"+hId
		self.removeZset(str,key)
	}
	//获取英雄排名表
	self.getHeroRankList = function(heroId,cb) {
		var str = "heroRank:"+heroId
		self.zrevrangewithscore(str,0,9,function(list) {
			var info = {}
			info.uids = []
			info.hIds = []
			info.ces = []
			for(var i = 0;i < list.length;i += 2){
				var arr = list[i].split("_")
				info.uids.push(arr[0])
				info.hIds.push(arr[1])
				info.ces.push(list[i+1])
			}
			self.getPlayerInfoByUids(info.uids,function(userInfos) {
				info.userInfos = userInfos
				self.heroDao.getDiffHeroList(info.uids,info.hIds,function(flag,list) {
					if(flag){
						info.heros = list
						cb(true,info)
					}else{
						cb(false,list)
					}
				})
			})
		})
	}
	//获取单个英雄排名
	self.getHeroRankOne = function(uid,hId,heroId,cb) {
		var str = "heroRank:"+heroId
		var key = uid+"_"+hId
		self.zrevrank(str,key,function(data) {
			cb(true,data)
		})
	}
}