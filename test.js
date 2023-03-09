const key = new NodeRSA("MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCimZ5iIRKMjqVVAJU5Xkqg2ozLh4pg6z3VwXa8RMnqLirZ+n3gssJRCVVX0vOEefLJGH997h6GV9Gv97URHFAqoHrQP43nz6t0foizzTndYCJONoKFH1q8qnbdkVx2FzlMUUJOwPTRtZUw9RTEHPHAV+39mERtd6mLoB7HfcvW9/IdaSO3hmh90giaP598Sc6cKflVByZ22EgfqFJl2fU1cP4Ol/dnwiTSNqYGRABT05iLJHt2zeLn6d0hIw+QskzRUaep7G3+fhZGHyBQ93q3fziY6CtlOC59LSfr/Sn497M1Qjcq537qr98Y+Vp/usJeQE9UEE8WHK/yPJJfQdbpAgMBAAECggEAVBKWACsVijOfbOoWPklw0Obv8bStaht4J3QWzpXKyRkB8x8/wtTrADeRNw3N9+uOC0htc1GR2ujBdPjhWG2JTeEYX2DdIMUR4/Qg/sbYaoxwcHxi1C44HmENgNbONgkgCUPiwxGmBGCdOWkfSZ+lqExOs9btWqSKt7Uc9Q0oPoe0fGELCwfN9BrB5dJW9hU9Rx+o32PfdAG4xpnwh9J++ssTulrVUuhU6ZGEcR6aVdqXkR/89EicZm5vmACXt92A76zB30ptQz05RooSLG2Fc8g6oMnKAQZbTUQMXze02aIm37eXO8i1d/awoP1Fqqg6T+aqe04j04DXcbfpRPlGeQKBgQDpKNDStPkOCzDft6R8vQ9sIWzluimZwlwv2p4G/GDZJ4irSVjVSxtQ9w8kpSyGYMx66D/y5kNKcpmmpZkhlxF2RYNWv1gcu8ABXogQl+9gMvN/qqjEdYZISNPa/VelN4SSJL9+sy3fa/Rgcf6AtAUQxWg/afu4FZEHykIuUoOxCwKBgQCyh0/HuYGqjxcmT+vcG2EZmol2bZtdHG3bEubLOZVX2RG4KNBaWfQVbpbkdmNgG9D/etseoUVX9o21TutIOHl4yGmRx+5ZxRaejcjEKA721ZxPO2x7mZVPQ3p0FiCGPcsQAcKgY0wpE7ITuZC3f2w5XrH/nIiq37FFtrEprNa4WwKBgCz6zcZIWV+nMweFovrZcjc2/44V6t6ZyzUEJMZOO9TItqnsnXGQarWk48v6/WrzE5+GXIfcehDLqO6oNbFwNlMtt9etVC8+3RymgvNIjEpvqd/wKVy1G3Gocw5lH1plKnMTGco0gN4AMoXEmAd2Mx/4JVNOe9wYdQEeuMO88WDfAoGAIRsYf0f2NKOuPkuJyFpHalEO9qgirGSONpbNt5fpCs5VC9p9sJOHwMWuM5WEnhjqa8Xjhk2Pp10wMBP/a3gVhoFbmk4B9CGpLSPLvBxVkg5QmxzA5Da5ymYP+iD0TRB+bGx3I/jl8aQWXLQHkw+NCSJ3TZhAe7dZjzzuo3TKqIsCgYEA1CzXGF5Ia+glJ84y/JEsTb3hpBG+dND11O2NexE6T6Ftw4a+6BDW2Sg/bN6OyC1myDNGYOAS4PAKbRwCgwpwgCTWViGkO8LHFpUdUduVVHjNTLVDbosfC+RExLtOG3WZ0u09opSsZfsagm9A2V+Ctd3RVNUUoIeiYU/ru2nz0GE=",'pkcs8-private'); //生成2048位的密钥
console.log("key")
// let publicDer = key.exportKey("pkcs1-public-pem");  //公钥
// let privateDer = key.exportKey("pkcs1-private-pem");//私钥
// //由于我们公司需要提交的公钥不需要有头部尾部换行，简单来说就是只要一个字符串           
// publicDer = publicDer.replace(/\n/g,'');
// publicDer = publicDer.replace('-----BEGIN RSA PUBLIC KEY-----','');
// publicDer = publicDer.replace('-----END RSA PUBLIC KEY-----','');
// //接接上面的代码哈
// 先导入私钥
 // key.importKey(privateDer ,"pkcs1-private-pem");
// hash是一个待签署的哈希值，是个base64的
let signedHash = key.sign("hash","base64","base64"); //私钥签名后的结果是个base64格式的哦
console.log(signedHash)