const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

async function connectToMongo() {
  try {
    await mongoose.connect('mongodb+srv://jashan:jashan@jashan.ulgyp2g.mongodb.net/dailybook?retryWrites=true&w=majority').then(()=>{console.log("connect to mongodb sucessfull")})
  } catch (error) {
    console.log("Failed to connect")
  } 
}

module.exports = connectToMongo;