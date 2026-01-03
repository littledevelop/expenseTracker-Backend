import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRouter.js";
import expenseRouter from "./routes/expenseRouter.js";
import incomeRouter from "./routes/incomeRouter.js";
dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use("/api", userRouter);
app.use("/api", expenseRouter);
app.use("/api", incomeRouter);
connectDB();

app.get("/", (req, res) => {
  res.send("Server is running...");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
