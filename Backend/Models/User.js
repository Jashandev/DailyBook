const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
      name:{
         type: String,
         require: true,
         trim: true
      },
      phone:{
         type: Number,
         require: true,
         unique: true,
         trim: true
      },
      Authentication : [{
         otp : {
            type: Number,
            trim: true
         } ,
         vaild : {
            type: Date,
            default: Date.now
         } ,
         mailres : {
            type: String,
            trim: true
         }
       }],
      email:{
         type: String,
         require: true,
         unique: true,
         trim: true
      },
      password:{
         type: String,
         require: true
      },
      date:{
         type: Date,
         default: Date.now
      },  
}, { timestamps: true } );

const User = mongoose.model('users',UserSchema);
module.exports = User;