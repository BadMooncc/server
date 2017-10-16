var express = require('express');
var router = express.Router();
var User=require('./../models/users.js');
require('./../util/util.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/test',function(req,res,next){
  let a={"name":"tom","age":123};
  res.json(a);
});
var resultObj={};
router.post('/login',function(req,res,next){
	var param={
		userName:req.body.username,
		userPwd:req.body.password
	};
	console.log(param)
	User.findOne({},function(err,doc){
		
		if(doc){

			res.cookie('userId',doc.userId,{
				path:'/',
				maxAge:1000*60*60*24
			});
			// req.session.user=doc;
			resultObj.status='0';
			resultObj.msg='登录成功';
			resultObj.result={
				username:doc.userName
			}
			res.json(resultObj);
		
			
		}else{
			resultObj.status='1';
			resultObj.msg='账号或密码错误';
			res.json(resultObj);
				
		}
	});
});
//退出接口
router.post('/logout',function(req,res,next){
	res.cookie('userId','',{
		path:'/',
		maxAge:-1
	});
	resultObj.status='0';
	resultObj.msg='';
	resultObj.result='';
	res.json(resultObj)
});


router.post('/checkLogin',function(req,res,next){
	console.log(req.body)
	if(req.body.userId){
		User.findOne({userId:req.body.userId},function(err,doc){
			res.json({
				status:'0',
				msg:'',
				result:doc.userName || ''
			});
		})
		
	}else{
		res.json({
			status:'1',
			msg:'未登录',
			result:''
		})
	}
});


//购物车列表
router.get('/cart',function(req,res,next){
	let userId=req.cookies.userId;
	console.log(userId);
	User.findOne({userId:userId},function(err,doc){
		if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			});
		}else{
			res.json({
				status:'0',
				msg:'',
				result:doc.cartList
			})
		}
		
	})
});
//删除物品
router.post('/cart/del',function(req,res,next){
	console.log(req.body.productId);
	console.log(req.cookies.userId);
	User.update(
		{userId:req.cookies.userId},
		{$pull:{'cartList':{'productId':req.body.productId}}},
		function(err,doc){

			if(err){
				res.json({
					status:'1',
					msg:'删除失败',
					result:''
				})
			}else{
				res.json({
					status:'0',
					msg:'删除成功',
					result:doc
				})
			}
	})
});
//购物车编辑接口

router.post('/cart/edit',function(req,res,next){
	var userId=req.cookies.userId,
		productId=req.body.productId,
		checked=req.body.checked,
		productNum=req.body.productNum;
		console.log(req.body)
		User.update({'userId':userId,'cartList.productId':productId},
			{'cartList.$.productNum':productNum,'cartList.$.checked':checked},function(err,doc){

				if(err){
					res.json({
						status:'1',
						msg:'更新失败',
						result:''
					})
				}else{
					res.json({
						status:'0',
						msg:'更新成功',
						result:doc
					})
				}

			});

});

router.post('/edit/checkedAll',function(req,res,next){
	var userId=req.cookies.userId,
		checkAll=req.body.checkAll==true?'1':'0';
		User.findOne({userId:userId},function(err,doc){
			if(err){
				res.json({
					status:'1',
					msg:'更新失败',
					result:''
				})
			}else{
				console.log(doc)
				doc.cartList.forEach((item)=>{
					item.checked=checkAll;
				});
				doc.save(function(err1,doc1){
					if(err1){
						res.json({
							status:'1',
							msg:'更新失败',
							result:''
						})
					}else{
						res.json({
							status:'0',
							msg:'更新成功',
							result:doc
						})
					}
				});
				
			}
		})
});
//地址接口
router.get('/address/list',function(req,res,next){
	var userId=req.cookies.userId;
	User.findOne({userId:userId},function(err,doc){
		if(err){
			res.json({
				status:'1',
				msg:'查询失败',
				result:''
			});
		}else{
			res.json({
				status:'0',
				msg:'查询成功',
				result:doc.addressList
			})
		}
	});
});
//默认地址接口
router.post('/address/default',function(req,res,next){
	var userId=req.cookies.userId,
		addressId=req.body.addressId;

	User.findOne({userId:userId},function(err,doc){
		
		if(err){
			res.json({
				status:'1',
				msg:'查询失败',
				result:''
			})
		}else{
			var addressList=doc.addressList;
			
			addressList.forEach((item)=>{
				if(item.addressId==addressId){

					item.isDefault=true;
				}else{
					item.isDefault=false;
				}
			});
			doc.save(function(err1,doc1){
				if(err1){
					res.json({
						status:'1',
						msg:'设置失败',
						result:''
					})
				}else{
					res.json({
						status:'0',
						msg:'设置成功',
						result:''
					})
				}
			});
		}
	});
});
//删除地址接口
router.post('/address/delete',function(req,res,next){
	var userId=req.cookies.userId;
	var addressId=req.body.addressId;
	
	User.update(
		{userId:userId},
		{$pull:{'addressList':{'addressId':addressId}}},
		function(err,doc){
			
			console.log(doc);
			if(doc.nModified=='1'){
				res.json({
					status:'0',
					msg:'删除成功',
					result:doc
				});
			}else{
				res.json({
					status:'1',
					msg:'删除失败',
					result:''
				});
			}
	})
});

router.post('/payment',function(req,res,next){
	var userId=req.cookies.userId,orderTotal=req.body.orderTotal,addressId=req.body.addressId;
	User.findOne({userId:userId},function(err,doc){
		if(err){
			res.json({
				status:'1',
				msg:'失败',
				result:''
			});
		}else{
			var address='',goodsList=[];
			//获取当前用户的地址信息
			doc.addressList.forEach((item)=>{
				if(addressId==item.addressId){
					address=item;
				}
			});
			//获取用户购买的商品
			doc.cartList.forEach((item)=>{
				if(item.checked=='1'){
					goodsList.push(item);
				}
			});
			var platform='622';
			var r1=Math.floor(Math.random()*10);
			var r2=Math.floor(Math.random()*10);
			var systemDate=new Date().Format('yyyyMMddhhmmss');
			var createDate=new Date().Format('yyyy-MM-dd hh:mm:ss');
			var orderId=platform+r1+systemDate+r2;
			var order={
				orderId:orderId,
				orderTotal:orderTotal,
				addressInfo:address,
				goodsList:goodsList,
				orderStatus:'0',
				createDate:createDate
			};
			doc.orderList.push(order);
			doc.save(function(err1,doc1){
				console.log(doc1);
				if(err1){
					res.json({
						status:'1',
						msg:'失败',
						result:''
					});
				}else{
					res.json({
						status:'0',
						msg:'',
						result:{
							orderTotal:order.orderTotal,
							orderId:order.orderId
						}
					});
				}
			});
			
		}
	});

});
router.get('/getCartCount',function(req,res,next){
	if(req.cookies && req.cookies.userId){
		var userId=req.cookies.userId;
		User.findOne({userId:userId},function(err,doc){
			if(err){
				res.json({
					status:'1',
					msg:'未登录',
					result:''
				});
			}else{
				var cartList=doc.cartList;
				let cartCount=0;
				cartList.map(function(item){
					cartCount+=parseInt(item.productNum);
				});
				res.json({
					status:'0',
					msg:'',
					result:cartCount
				});
			}
		});
	}
});
module.exports = router;
