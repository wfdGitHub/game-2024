var key = '88049844578484520615487574815873';

//调用解密
var xml = decode(str,key);
console.log(xml);

//QuickSDK参数同步解码方法
//输入密文、callbackKey
//成功返回解密后的xml字符
//失败会空字符串,长度为0
function decode(str,key){

	if(str.length <= 0){
		return '';
	}

	var list = new Array();
	var resultMatch = str.match(/\d+/g);
	for(var i= 0;i<resultMatch.length;i++){
		list.push(resultMatch[i]);
	}

	if(list.length <= 0){
		return '';
	}
	
	var keysByte = stringToBytes(key);
	var dataByte = new Array();
	for(var i = 0 ; i < list.length ; i++){
		dataByte[i] = parseInt(list[i]) - (0xff & parseInt(keysByte[i % keysByte.length]));
	}

	if(dataByte.length <= 0){
		return '';
	}

	var parseStr = bytesToString(dataByte);
	return parseStr;
}



function stringToBytes (str) {  
	var ch, st, re = [];  
  	for (var i = 0; i < str.length; i++ ) {  
    	ch = str.charCodeAt(i);
    	st = []; 
    	do {  
      		st.push( ch & 0xFF );
      		ch = ch >> 8;
    	}while ( ch );  
    	re = re.concat( st.reverse() );  
	}  
  	return re;  
} 


function bytesToString(array) {
  return String.fromCharCode.apply(String, array);
}