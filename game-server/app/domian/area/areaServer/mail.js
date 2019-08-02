//邮件系统
module.exports = function() {
	//获取所有邮件

	//发送邮件
	this.sendMail = function(uid,title,text,atts,cb) {
		var mailInfo = {
			title : title,
			text : text
		}
		if(atts){
			mailInfo.atts = atts
		}
		
	}
	//领取邮件附件
	this.gainMailAttachment = function() {
		// body...
	}
	//阅读邮件
	this.readMail = function() {
		// body...
	}
	//删除邮件
	this.deleteMail = function() {
		// body...
	}
	//一键领取
	this.gainAllMailAttachment = function() {
		// body...
	}
	//一键删除
	this.deleteAllMail = function() {
		// body...
	}
}