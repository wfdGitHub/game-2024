var util = function() {}
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