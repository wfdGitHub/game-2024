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
//获取本周周一的时间戳
util.prototype.getWeekZeroTime = function(){
    var nowTemp = new Date();//当前时间
    nowTemp.setHours(0,0,0,0)
    var oneDayLong = 24*60*60*1000 ;//一天的毫秒数
    var c_time = nowTemp.getTime() ;//当前时间的毫秒时间
    var c_day = nowTemp.getDay()||7;//当前时间的星期几
    var m_time = c_time - (c_day-1)*oneDayLong;//当前周一的毫秒时间
    var monday = new Date(m_time);//设置周一时间对象
    return monday.getTime()
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
//从数组获取一个随机目标
util.prototype.getRandomOne = function(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}
//从数组获取指定数量的目标
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
//数字范围随机
util.prototype.randomFrom = function(lowerValue, upperValue) {
    return Math.floor(Math.random() * (upperValue - lowerValue + 1) + lowerValue);
}
//数字随机分割
util.prototype.randomFigure = function(number, count) {
    var list = []
    var weights = []
    var allWeight = 0
    var curValue = 0
    for(var i = 0;i < count;i++){
        weights[i] = this.randomFrom(100,400)
        allWeight += weights[i]
    }
    for(var i = 0;i < count;i++){
        if(i == (count-1)){
            list[i] = number - curValue
        }else{
            list[i] = Math.floor(number * weights[i] / allWeight)
            curValue += list[i]
        }
    }
    return list;
}
//根据权重概率随机  权重需提前排序
util.prototype.getWeightedRandomBySort = function(weights) {
    if(!weights.length)
        return 0
    var rand = Math.random() * weights[weights.length-1]
    for(var i = 0;i < weights.length;i++)
        if(rand < weights[i])
            return i
    return 0
}
util.prototype.arrayIndexOf = function(array,val) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == val) return i;
    }
    return -1;
}
util.prototype.arrayRemove = function(array,val) {
    var index = this.arrayIndexOf(array,val);
    if (index > -1) {
        array.splice(index, 1);
    }
}
module.exports = new util()