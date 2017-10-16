const mongoose=require('mongoose');
var Schema=mongoose.Schema;

let productSchema =new Schema({
  "productId":String,
  "productName":String,
  "salePrice":Number,
  "productImage":String,
  "checked":String,
  "productUrl":String
});


module.exports=mongoose.model('goods',productSchema);
