const User = require ("../models/User");
const mailSender = require ("../utils/mailSender");
const bcrypt = require('bcrypt');
const crypto = require("crypto");
exports.resetPasswordToken = async (req, res) =>{
    try {
        //console.log('HII');
        const email = req.body.email;
        const user = await User.findOne({email});
        //console.log('email ',email);
        //console.log('user ',user);

        if(!user){
            return res.status(401).json({
                success:false,
                message:"Your email is not registered with us"
            });
        }
        
        //const token = crypto.randomUUID();
        const token = crypto.randomBytes(20).toString("hex");
        const updateDetails = await User.findOneAndUpdate(
            {email:email},
            {
                token:token,
                //resetPasswordExpires: Date.now() + 5*60*1000,
                resetPasswordExpires: Date.now() + 3600000,
            },
            {new:true}
        );
        //console.log("DETAILS", updateDetails);

        //const url = `http://localhost:3000/update-password/${token}`
        const url = `http://localhost:5173/update-password/${token}`

        await mailSender(
            email,
            "Password Reset Link",
            `Password Reset Link: ${url}`
        );
        return res.status(200).json({
            success:true,
            message:"Email send successfully Please check your email and reset password"
        }); 
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success:false,
            message:"Erro while sending email"
        }); 
    }
} 


exports.resetPassword = async (req , res) => {
    try {
        const {password , confirmPassword ,token} = req.body;
        if (password !== confirmPassword){
            return res.status(401).json({
                success:false,
                message:"Paswword doesn't match"
            }); 
        }
        if (!token){
            return res.status(500).json({
                success:false,
                message:"Token is missing"
            });
        }
        //console.log('token ',token);
        const userDetails = await User.findOne({token:token});
        //console.log(' userDetails ',userDetails);
        if (!userDetails){
            return res.status(500).json({
                success:false,
                message:"Token is invalid"
            });
        }
        //console.log('userDetails.resetPasswordExpires ',userDetails.resetPasswordExpires);
        //console.log('Date.now() ',Date.now());
        if (!(userDetails.resetPasswordExpires > Date.now())) {
            return res.status(401).json({
                success:false,
                message:"Token is expired , Please regenerate token"
            });
        }
        const hashedPassword = await bcrypt.hash(password,10);

        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true}
        )
        return res.status(200).json({
            success:true,
            message:"Password reset successfull"
        });

    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success:false,
            message:"Erro while sending email"
        });
        
    }
}
