import express from "express";
import { addIncome, deleteIncome, editIncome, getIncome } from "../controllers/incomeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const incomeRouter = express.Router();

incomeRouter.post('/add-income', authMiddleware, addIncome);
incomeRouter.delete('/delete-income/:id', authMiddleware, deleteIncome);
incomeRouter.put('/update-income/:id', authMiddleware, editIncome);
incomeRouter.get('/get-income', authMiddleware, getIncome);

export default incomeRouter;
