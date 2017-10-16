const {username}=require('./User');
const http=require('http');
const util=require('util');
const url=require('url');
const fs=require('fs');
const server=http.createServer((req,res)=>{
  let pathname=url.parse(req.url).pathname;

  fs.readFile(pathname.substring(1),(err,data)=>{
    console.log(data);
    if(err){
      res.writeHead(404,{
        'Content-Type':'text/html'
      })
    }else{
      res.writeHead(200,{
        'Content-Type':'text/html'
      });
      res.write('data.toString');
    }
    res.end();
  });

  res.end();
});
console.log(username);
server.listen(3000,'127.0.0.1',()=>{
  console.log('Run successfully on port 3000');
});
