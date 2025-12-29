import userModel from "../models/userModel.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const register= async(req,res)=>{
    try{

        const {name,email,password} = req.body;

        if(!name || !email || !password){
            return res.status(400).json({success:false,message:"All fields are required"});
        }

        const existingUser = await userModel.findOne({email});

        if(existingUser){
            return res.status(400).json({success:false,message:"User already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new userModel({name,email,password:hashedPassword});

        await newUser.save();

        //generate json  jwt token (optional)

        const token = jwt.sign({userId:newUser._id,email:newUser.email},process.env.JWT_SECRET,{expiresIn:'7d'});

        res.cookie(token,{
            httpOnly:false,
            secure:false,
            sameSite:'Lax',
            maxAge:7*24*60*60*1000
        });

        const userResponse = {
            id:newUser._id,
            name:newUser.name,
            email:newUser.email,
            // token:token
        }

        res.status(201).json({success:true,message:"User registered successfully",user:userResponse,token});

    }catch(err){
        console.log(err);
        res.status(500).json({success:false,message:"Server Error"});
    }
}

const login = async(req,res) => {

    try{

        const {email,password} = req.body;

        if(!email || !password){
            return res.status(401).json({success:false,message:"All fields are required"});
        }

        const user = await userModel.findOne({email});

        if(!user){
            return res.status(401).json({success:false,message:"user not found,Invalid credentials"});
        }
        
        const isPasswordValid = await bcrypt.compare(password,user.password);
        console.log(isPasswordValid);
        if(!isPasswordValid){
            return res.status(401).json({success:false,message:"Invalid credentials"});
        }

        const token = jwt.sign({userId:user._id,email:user.email},process.env.JWT_SECRET,{expiresIn:'7d'});

        res.cookie(token,{
            httpOnly:false,
            secure:false,
            sameSite:'Lax',
            maxAge:7*24*60*60*1000
        });

        const userResponse = {
            id:user._id,
            name:user.name,
            email:user.email,
            token:token
        }

        res.status(200).json({success:true,message:"User logged in successfully",user:userResponse,token});

    }catch(err){
        console.log(err);
        res.status(500).json({success:false,message:"Server Error"});
    }


}

const forgotPassword = async(req,res)=>{
    try{

        const {email} = req.body;
        if(!email)
            return res.status(400).json({success:false,message:"Email should not be blank"})
            
        const user = await userModel.findOne({email});

        if(!user)
            return res.status(400).json({success:false,message:"User Not Found"});

        const token = jwt.sign({userId:user._id,email:user.email},process.env.JWT_SECRET,{expiresIn:'7d'});
        const resetLink = `http://localhost:3000/reset-password/{token}`;
        console.log("Reset Link:", resetLink);
        res.json({msg:"Password Reset Link sent to be email"});
        
    }catch(error){
        console.log(error);
        res.status(500).json({success:false,message:"Server Error"});
    }

}

const resetPassword = async(req,res)=>{
    try{

        const {email, password} = req.body;
        const {token} = req.params;
        if(!email || !password) 
            res.status(400).json({success:false,message:"All Fields are required"});

        if(!token)
            res.status(400).json({success:false,message:"Unauthorized User"});

        const decoded = jwt.verift(token,process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(password,10);

        await userModel.findByIdAndUpdate(decoded.id,{password:hashedPassword});
        res.json({msg:"Password Updated Successfully"});
        

    }catch(error){
        console.log(error)
        res.status(500).json({success:false,message:"Server Error"});
    }
}
export {register,login,forgotPassword,resetPassword};