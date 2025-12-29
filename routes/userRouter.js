import express from "express";
import { register, login, forgotPassword, resetPassword } from "../controllers/userController.js";
// import authMiddleware from "../middlewares/authMiddleware.js";
// import { addIncome } from "../controllers/incomeController.js";
const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/forgotPassword",forgotPassword);
userRouter.put("/resetPassword",resetPassword);
// userRouter.post('/user/add-income', authMiddleware, addIncome);

export default userRouter;