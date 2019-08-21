var buffBasic = require("./buffBasic.js")
//属性增益buff
var lessAtt = function(character,target,otps) {
	buffBasic.call(this,character,target,otps)
	var self = this
	this.atts = {}
	this.count = 0
	this.target = target
	//初始化
	this.init = function() {
		this.addAtt(this.buffArg,this.duration)
	}
	//新增增益BUFF
	this.overlay = function(character,newOtps) {
		if(this.duration < newOtps.duration * 1000){
			this.duration = newOtps.duration * 1000
		}
		this.addAtt(newOtps.buffArg,newOtps.duration * 1000)
	}
	//增加属性BUFF
	this.addAtt = function(str,duration) {
		var strList = str.split("&")
		for(var i = 0;i < strList.length;i++){
	      var m_list = strList[i].split(":")
	      var name = m_list[0]
	      var value = Number(m_list[1])
	      value = parseInt(this.target.getBasicAtt(name) * value)
	      if(value){
		    if(!this.atts[name]){
		        this.atts[name] = {}
		    }
	      	this.atts[name][this.count++] = {value : value,duration : duration}
	      }else{
	      	console.log(new Error("addAtt error"+name+value))
	      }
		}
	}
	//清除增益BUFF
	this.clearAtt = function(name,key) {
		delete this.atts[name][key]
		if(JSON.stringify(this.atts[name]) == "{}"){
			delete this.atts[name]
		}
	}
	this.updateLate = function(dt) {
		for(var name in this.atts){
			for(var i in this.atts[name]){
				this.atts[name][i]["duration"] -= dt
				if(this.atts[name][i]["duration"] <= 0){
					this.clearAtt(name,i)
				}
			}
		}
	}
	this.clear = function() {
	}
	this.getlessAtt = function(name) {
		var maxValue = 0
		if(this.atts[name]){
			for(var i in this.atts[name]){
				if(this.atts[name][i]["value"] > maxValue){
					maxValue = parseInt(this.atts[name][i]["value"])
				}
			}
		}
		return maxValue
	}
}
lessAtt.prototype = buffBasic.prototype
module.exports = lessAtt