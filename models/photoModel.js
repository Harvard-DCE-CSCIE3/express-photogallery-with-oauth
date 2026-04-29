const mongoose = require("mongoose");

//get access to Schema constructor
const Schema = mongoose.Schema;

//create a new schema for our app
const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  originalname: {type: String, required:true},
  mimetype: {type: String, required:true},
  // filename: {type: String, required:true},
  imageUrl: {type: String, required:true},
  description: {type: String, required:false},
  title: {type: String, required:false},
  size: {type: String, required:true},
  createdAt: {type: Date},
  updatedAt: {type: Date}
});

schema.pre('save', function(){
  if (!this.createdAt){
    this.createdAt = new Date();
  }else{
    this.updatedAt = new Date();
  }
});

// export the model with associated name and schema
module.exports = mongoose.model("Photo", schema);
