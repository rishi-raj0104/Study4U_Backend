const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');
const emailTemplate = require("../mail/templates/emailVerificationTemplate");
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
        //const mailResponse = await mailSender(email,'Verification Email',otp);
        const mailResponse = await mailSender(
            email,
            "Verification Email",
            emailTemplate(otp)
        );
        //console.log("Email sent successfully: ", mailResponse.response);
        //console.log('Email Send Sucessfully',mailResponse);
    }
    catch(error){
        console.log("Error Occured",error);
        throw error;
    }
}

// OtpSchema.pre('save', async function(next){
//     await sendVerificationEmail(this.email,this.otp);
//     next();
// })
OtpSchema.pre('save', async function(next) {
    try {
        await sendVerificationEmail(this.email, this.otp);
    } catch (error) {
        console.log("Error sending email, but proceeding with save:", error);
    }
    next();
});
module.exports = mongoose.model("Otp",OtpSchema);