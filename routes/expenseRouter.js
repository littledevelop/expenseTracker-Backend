import express from "express";
import { addExpense, deleteExpense, editExpense, getExpense } from "../controllers/expenseController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const expenseRouter = express.Router();

expenseRouter.post('/add-expense', authMiddleware, addExpense);
expenseRouter.delete('/delete-expense/:id', authMiddleware, deleteExpense);
expenseRouter.put('/update-expense/:id', authMiddleware, editExpense);
expenseRouter.get('/get-expense', authMiddleware, getExpense);

export default expenseRouter;
