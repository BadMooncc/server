const mongoose=require('mongoose');
const Schema=mongoose.Schema;

let userSchema=new Schema({
  "userId":String,
  "userName":String,
  "userPwd":String,
  "orderList":Array,
  "cartList":[
    {
      "productId": String,
      "productName": String,
      "salePrice": Number,
      "productImage": String,
      "productUrl": String,
      "checked": String,
      "productNum":{
        type:Number,
        default:1
      }
    }
  ],
  "addressList":[
            {
              "addressId":String,
              "userName":String,
              "streetName":String,
              "postCode":Number,
              "tel":Number,
              "isDefault":Boolean
            }
      
  ]
});

module.exports=mongoose.model('users',userSchema);
