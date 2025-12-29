import ExpenseModel from '../models/expenseModel.js';

// Create a new expense entry
const addExpense = async (req, res) => {
    const userId = req.user?.id;

    const {title, amount, type, category, date, description} = req.body;

    const parsedAmount = Number(amount);

    try {
        if(!title || !amount || !type || !category || !date) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if(isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ success: false, message: "Amount must be a positive number" });
        }

        const newExpense = new ExpenseModel({
            userId,
            title,
            amount: parsedAmount,
            type,
            category,
            date,
            description
        });

        await newExpense.save();
        res.status(201).json({ success: true, message: "Expense added successfully", data: newExpense });

    } catch (error) {
        console.error("Error adding expense:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

const deleteExpense = async (req, res) => {
    const expenseId = req.params.id;

    try {
        const deletedExpense = await ExpenseModel.findByIdAndDelete(expenseId);

        if(!deletedExpense) {
            return res.status(404).json({ success: false, message: "Expense not found" });
        }

        res.status(200).json({ success: true, message: "Expense deleted successfully" });

    } catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

const editExpense = async (req, res) => {
    const expenseId = req.params.id;
    const userId = req.user?.id;

    const {title, amount, category, date, description} = req.body;

    try {
        const updateExpense = await ExpenseModel.findById(expenseId);

        if(!updateExpense) {
            return res.status(404).json({ success: false, message: "Expense not found" });
        }

        // Update fields if provided
        if(title !== undefined) updateExpense.title = title;
        if(amount !== undefined) updateExpense.amount = Number(amount);
        if(category !== undefined) updateExpense.category = category;
        if(date !== undefined) updateExpense.date = date;
        if(description !== undefined) updateExpense.description = description;
        await updateExpense.save();
        res.status(200).json({ success: true, message: "Expense updated successfully", data: updateExpense });

    } catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

const getExpense = async (req, res) => {
    const userId = req.user?.id;

    try {
        const expenses = await ExpenseModel.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: expenses });

    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export { addExpense, deleteExpense, editExpense, getExpense };
