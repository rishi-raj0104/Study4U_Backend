const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');
const OtpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:5*60,
    }
});

async function sendVerificationEmail(email ,otp){
    try{
        const mailResponse = await mailSender(email,'Verification Email',otp);
        console.log('Email Send Sucessfully',mailResponse);
    }
    catch(error){
        console.log("Error Occured",error);
        throw error;
    }
}

OtpSchema.pre('save', async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})
module.exports = mongoose.model("Otp",OtpSchema);