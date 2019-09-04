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
module.exports = new util()