 import { get } from 'mongoose';
import IncomeModel from '../models/incomeModel.js';

// Create a new income entry
const addIncome = async (req, res) => {
    const userId = req.user?.id;
    // console.log("User ID from auth middleware:", userId);

    const {title,amount,type,category,date,description}=req.body;
    // console.log("Request body:", req.body);
    const parsedAmount = Number(amount);
    // const parsedAmount = parseFloat(amount);
  try {

    if(!title || !amount || !type || !category || !date || !description){
        return res.status(400).json({ success:false,message: "All fields are required" });
    }

    if(isNaN(parsedAmount) || parsedAmount <= 0){
        return res.status(400).json({ success  :false,message: "Amount must be a positive number" });
    }

    const newIncome = new IncomeModel({
        userId,
        title,
        amount: parsedAmount,   
        type,
        category,
        date,
        description
    });

    await newIncome.save();
    res.status(201).json({ success:true,message: "Income added successfully", data: newIncome });

  }catch (error) {
    console.error("Error adding income:", error);
    res.status(500).json({ success:false,message: "Server Error" });
  }

}

const deleteIncome = async (req, res) => {
    const incomeId = req.params.id;
    // const userId = req.user?.id;
    try {

        const income = await IncomeModel.findByIdAndDelete(incomeId);

        if(!income){
            return res.status(404).json({ success:false,message: "Income not found" });
        }   

        res.status(200).json({ success:true,message: "Income deleted successfully" });

    }catch (error) {
        console.error("Error deleting income:", error);
        res.status(500).json({ success:false,message: "Server Error" });
    }
}

const editIncome = async (req, res) => {
  
    const {id}= req.params;
    const {title,amount,income,category,date,description}=req.body;
    const parsedAmount = Number(amount);

    try{
         
        const updatedIncome = await IncomeModel.findById(id);
        
        if(!updatedIncome){
            return res.status(404).json({success:false,message:"Income not found to update"});
        }
    
        updatedIncome.title = title || updatedIncome.title;
        updatedIncome.amount = amount || updatedIncome.amount;
        updatedIncome.income = income || updatedIncome.income;
        updatedIncome.category = category || updatedIncome.category;
        updatedIncome.description = description || updatedIncome.description;
        updatedIncome.date = date || updatedIncome.date;
        
        await updatedIncome.save();
        res.status(200).json({ success:true,message: "Income updated successfully",data:updatedIncome });

    }catch(err){
        console.log("Error editing income:", err);
        res.status(500).json({ success:false,message: "Server Error" });
    }

}

const getIncome = async(req,res)=>{
    try{

        const userId= req.user?.id;
        const getincome = await IncomeModel.find({userId:userId});

        if(!getincome){
            return res.status(404).json({success:false,message:"Income not found"});
        }

        res.status(200).json({success:true,data:getincome});
    }catch(error){
        console.log(error)
        res.status(500).json({success:false,message:"Internal server error"});
    }

}

export { addIncome , deleteIncome , editIncome, getIncome };