const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');
const goods=require('../models/goods');
const users=require('../models/users');
mongoose.connect('mongodb://127.0.0.1:27017/db_demo');
mongoose.connection.on('connected',function () {
    console.log('MongoDB connected success');
});
mongoose.connection.on('error',function () {
  console.log('MongoDB connected failed');
});
mongoose.connection.on('disconnected',function () {
  console.log('MongoDB connected disconnected');
});
let result={};
let cartRes={};
//商品列表接口
router.get('/list',function(req,res,next){

  let page=parseInt(req.query.page);
  let pageSize=parseInt(req.query.pageSize);
  let sort=parseInt(req.query.sort);
  let skip=(page-1)*pageSize;
  let level=JSON.parse(req.query.priceLevel);
  console.log(level);
  let priceGt=null,priceLt=null;
  let params={};
  if(level.priceGt) {
    priceGt=parseInt(level.priceGt);
    priceLt=parseInt(level.priceLt);
    console.log(priceGt);
    params={
      salePrice:{
        $gt:priceGt,
        $lt:priceLt

      }
    }
  }

  let goodsModel=goods.find(params).skip(skip).limit(pageSize);
  goodsModel.sort({'salePrice':sort});
  goodsModel.exec().then((data)=>{
        result.status='0';
        result.msg={count:data.length,data:data};

        res.json(result);
  })
});
//购物车接口
router.post("/addCart",function(req,res,next){
  let userId='100000077';
  let productId=req.body.productId;
  console.log(productId);


  users.findOne({userId:userId}).then(function(data){
    let goodsItem;
    console.log('unde'+goodsItem);
    console.log(data.cartList.length);
    for(let i=0;i<data.cartList.length;i++){
      console.log(data.cartList[i].productId);
      if(data.cartList[i].productId==productId){
        goodsItem=data.cartList[i].productId;
        data.cartList[i].productNum++;
      }
    }
    console.log(typeof goodsItem);
    if(goodsItem!=undefined){
      console.log('1111111111111111111111111')
      console.log('goodsitem'+goodsItem);
      data.save(function (err,suc) {
        if (err) {
          cartRes.status = '1';
          cartRes.msg = '';
          cartRes.result = 'defeat';
        } else {
          cartRes.status = '0';
          cartRes.msg = '';
          cartRes.result = 'success';
        }
        res.json(cartRes);
      });
      return;
    }
    goods.findOne({productId:productId},function(err,goodRes){
      goodRes.productNum=1;
      goodRes.checked=1;
      data.cartList.push(goodRes);
      data.save(function (err,suc) {
        if (err) {
          cartRes.status = '1';
          cartRes.msg = '';
          cartRes.result = 'defeat';
        } else {
          cartRes.status = '0';
          cartRes.msg = '';
          cartRes.result = 'success';
        }
        res.json(cartRes);
      });


    })
  })
});
module.exports=router;
