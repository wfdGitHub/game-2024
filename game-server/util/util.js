var util = function() {}
var md5 = require('md5-node');
util.prototype.binarySearch = function(arr,target){
    //var value = 0;
    var left = 0;
    var right = arr.length;
    while(left <= right){
        var center = Math.floor((left+right)/2); 
        if(target<arr[center]){
            right = center - 1;
        }else{
            left = center + 1;
        }
    }
    if(right >= arr.length){
        right = arr.length - 1
    }
    if(right < 0){
        right = 0
    }
    return arr[right];
}
util.prototype.binarySearchIndex = function(arr,target){
    //var value = 0;
    var left = 0;
    var right = arr.length;
    while(left <= right){
        var center = Math.floor((left+right)/2); 
        if(target<arr[center]){
            right = center - 1;
        }else{
            left = center + 1;
        }
    }
    if(right >= arr.length){
        right = arr.length - 1
    }
    if(right < 0){
        right = 0
    }
    return right;
}
//获取本周周一的时间
util.prototype.getWeek = function(){
    var nowTemp = new Date();//当前时间
    nowTemp.setHours(0,0,0,0)
    var oneDayLong = 24*60*60*1000 ;//一天的毫秒数
    var c_time = nowTemp.getTime() ;//当前时间的毫秒时间
    var c_day = nowTemp.getDay()||7;//当前时间的星期几
    var m_time = c_time - (c_day-1)*oneDayLong;//当前周一的毫秒时间
    var monday = new Date(m_time);//设置周一时间对象
    var m_year = monday.getFullYear();
    var m_month = monday.getMonth()+1;
    var m_date = monday.getDate();
    return m_year+'-'+m_month+'-'+m_date
}
//获取今年第几周
util.prototype.getWeekNum = function() {
    var nowTemp = new Date();//当前时间
    var oneDayLong = 24*60*60*1000 ;//一天的毫秒数
    nowTemp.setHours(0,0,0,0)
    var c_time = nowTemp.getTime() ;//当前时间的毫秒时间
    var c_day = nowTemp.getDay()||7;//当前时间的星期几
    var m_time = c_time - (c_day-1)*oneDayLong;//当前周一的毫秒时间
    var today = new Date(m_time);//设置周一时间对象
    var firstDay = new Date(today.getFullYear(),0, 1);
    var dayOfWeek = firstDay.getDay(); 
    var spendDay= 1;
    if (dayOfWeek !=0) {
        spendDay=7-dayOfWeek+1;
    }
    firstDay = new Date(today.getFullYear(),0, 1+spendDay);
    var d =Math.ceil((today.valueOf()- firstDay.valueOf())/ 86400000);
    var result =Math.ceil(d/7);
    return result+1;
}
//获取当天零点时间
util.prototype.getZeroTime = function(time){
    var nowTemp
    if(time)
        nowTemp = new Date(time);//当前时间
    else
        nowTemp = new Date();//当前时间
    nowTemp.setHours(0,0,0,0)
    return nowTemp.getTime()
}
util.prototype.getMonth = function(){
    let d1 = new Date();
    return d1.getFullYear() + "-" + d1.getMonth();
}
//获取今天为止的毫秒数
util.prototype.getDayMilliseconds = function() {
    var date = new Date()
    return ((date.getHours() * 60 + date.getMinutes()) * 60 + date.getSeconds()) * 1000 + date.getMilliseconds()
}
//获取两个时间戳相差自然日
util.prototype.getTimeDifference = function(time1,time2){
    var date1 = new Date(time1)
    var date2 = new Date(time2)
    date1.setHours(0,0,0,0)
    date2.setHours(0,0,0,0)
    var day = parseInt((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return day;
}
//生成随机token
util.prototype.randomString = function(len){
　　len = len || 32;
　　var $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
　　var maxPos = $chars.length;
　　var pwd = '';
　　for (i = 0; i < len; i++) {
        //0~32的整数
        pwd += $chars.charAt(Math.floor(Math.random() * (maxPos+1)));
　　}
　　return pwd;
}
util.prototype.md5 = function(str) {
    return md5(str)
}
util.prototype.getRandomArray = function(arr, count) {
    if(count > arr.length)
        count = arr.length
    var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}
util.prototype.trace = function(count) {
    var caller = arguments.callee.caller;
    var i = 0;
    count = count || 10;
    cc.log("***---------------------------------------- ** " + (i + 1));
    while (caller && i < count) {
        cc.log(caller.toString());
        caller = caller.caller;
        i++;
        cc.log("***---------------------------------------- ** " + (i + 1));
    }
}
Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};
Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};
module.exports = new util()