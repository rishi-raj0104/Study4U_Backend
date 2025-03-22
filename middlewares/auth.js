const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require ("../models/User");


exports.auth = async (req , res , next) => {
    try {
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ","");

        if(!token){
            return res.status(401).json({
                sucess:false,
                message:"Token is missing"
            });
        }

        try {
            const decode = await jwt.verify(token , process.env.JWT_SECRET);
            //console.log('decode ',decode);
            req.user = decode;
        } catch (error) {
            return res.status(401).json({
                sucess:false,
                message:"Token is invaid"
            });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            sucess:false,
            message:"Something went wrong while validation token"
        });
        
    }
}

exports.isStudent = async (req,res,next) => {
    try {
        if(req.user.accountType !== "Student") {
            return res.status(401).json({
                sucess:false,
                message:"This is a protected route for student only"
            });
        }
        next();
        
    } catch (error) {
        return res.status(500).json({
            status:failed,
            message:"User role cannot be verified"
        });
    }
}

exports.isInstructor = async (req,res,next) => {
    try {
        if(req.user.accountType !== "Instructor") {
            return res.status(401).json({
                sucess:false,
                message:"This is a protected route for Instructor only"
            });
        }
        next();
        
    } catch (error) {
        return res.status(500).json({
            status:failed,
            message:"User role cannot be verified"
        });
    }
}

exports.isAdmin = async (req,res,next) => {
    try {
        //console.log('HIIII');
        if(req.user.accountType !== "Admin") {
            return res.status(401).json({
                sucess:false,
                message:"This is a protected route for Admin only"
            }); 
        }
        next();
    } catch (error) {
        return res.status(500).json({
            status:failed,
            message:"User role cannot be verified"
        });
    }
}