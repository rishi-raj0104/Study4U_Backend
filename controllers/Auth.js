const User =require('../models/User');
const Otp =require('../models/Otp');
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const mailSender = require('../utils/mailSender');
require("dotenv").config();

const Profile = require('../models/Profile');
exports.sendOtp = async (req , res) =>{
    try {
        const {email}= req.body;

        const checkUserPresent = await User.findOne({email});
        
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User already registered",
            });
        }
         
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        // console.log(" OTP ",otp);

        const result = await Otp.findOne({otp:otp});
        
        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            })
          }
        const otpPayload = { email, otp }
        const otpBody = await Otp.create(otpPayload)
        //console.log("OTP Body", otpBody)
        
        res.status(200).json({
            success: true,
            message: 'OTP Sent Successfully',
            otp,
        });
          
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success:false,
            message: error.message
        });
        
    }
};

exports.signUp = async (req , res) =>{

   try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp )
        {
            return res.status(403).json({
                success:false,
                message:"All fields are mandatory"
            });
        }

        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message: 'Password and confirmPassword values does not match'
            })
        }
        const existingUser= await User.findOne({email});
        // const existingUser= await User.findOne({
        //     $or:[
        //         {email:email},
        //         {contactNumber:contactNumber}
        //     ]});
            
        if (existingUser){
            return res.status(400).json({
                success:false,
                message:'User is already registered',
            });  
        }

        const recentOtp = await Otp.find ({email}).
                                    sort({createdAt:-1})
                                    .limit(1);
        //console.log('recentOtp',recentOtp);
        //console.log('otp ',otp );
        // console.log('recentOtp.otp ',recentOtp[0].otp);
        if (recentOtp.length === 0) {
            return res.status(400).json({
                success:false,
                message:'OTP not found'
            });
        }
        else if (otp !== recentOtp[0].otp) {
            return res.status(400).json({
              success: false,
              message: "The OTP is not valid",
            })
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        return res.status(200).json({
            success:true,
            message:"User is registered"
        });
   } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered , Please try again! "
        });
   }
}

exports.login = async (req, res) =>{
    try {
        const {email , password} = req.body;

        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:'All fields are required, please try again',
            });
        }

        const user = await User.findOne({email}).populate("additionalDetails");
        //console.log('user ',user);
        if (!user){
            return res.status(401).json({
                success:false,
                message:'User is not registered, Please signup first',
            });
        }

        if(await bcrypt.compare(password,user.password)){
            const payload = {
                email : user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            })
            user.token = token;
            user.password = undefined;

            const options ={
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true
            }

            res.cookie("token",token , options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in successfully'
            });
        }
        else
        {
            return res.status(401).json({
                success:false,
                message:'Password is Invalid',
            });
        }
    
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login Failed',
        });
    }
}


exports.changePassword = async (req, res) =>{
    const userDetails = await User.findById(req.user.id);

    const {oldPassword , newPassword , confirmPassword} = req.body;

    if(!oldPassword || !newPassword || !confirmPassword)
    {
        return res.status(403).json({
            success:false,
            message:"All fields are mandatory"
        });
    }

    if(newPassword !== confirmPassword){
        return res.status(400).json({
            success:false,
            message: 'Password and confirmPassword values does not match'
        });
    }

    const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password
    )

    if (!isPasswordMatch) {
        return res.status(401).json({ 
            success: false, message: "The password is incorrect" 
        });
    }
    try {
        const MailSend = await mailSender(
            updatedUserDetails.email,
            "Password for your account has been updated",
            `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
        if (!mailSend) {
            return res.status(400).json({
                success: false,
                message: 'Unable to send email'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Password updated and email sent successfully'
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success:false,
            message:'Password change Failed',
        });
        
    }
}