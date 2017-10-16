const http=require('http');
const util=require('util');


http.get('http://www.imooc.com/index/getstarlist',(res)=>{
  let data='';
  res.on('data',(result)=>{
    data+=result;
  });
  res.on('end',()=>{
    let results=JSON.parse(data);
    console.log('result:'+util.inspect(results));
  });
});
