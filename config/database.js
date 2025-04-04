const mongoose = require('mongoose');
const dotenv = require("dotenv").config();

exports.connect = () =>{
    mongoose.connect(process.env.MONGO_DB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    })
    .then(()=> console.log("DB COnnected Sucessfully"))
    .catch( (error) => {
        console.log("DB Connection Failed");
        console.error(error);
        process.exit(1);
    })
}
