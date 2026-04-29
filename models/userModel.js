const mongoose = require('mongoose');

// get access to Schema constructor
const Schema = mongoose.Schema;

// create a new schema for our app
const schema = new Schema({
  googleId: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: false },
  createdAt: { type: Date },
  updatedAt: { type: Date }
});

schema.pre('save', function () {
  if (!this.createdAt) {
    this.createdAt = new Date();
  } else {
    this.updatedAt = new Date();
  }
});

// export the model with associated name and schema
module.exports = mongoose.model('User', schema);
