const express = require("express");
const router = express.Router();
const { Expense, Group, User } = require("../models/schema");
const mongoose = require("mongoose");
router.post("/create", async (req, res) => {
  const { description, amount, expense_date, group_id, paidBy, splitBetween } =
    req.body;
  const userId = req.userId;

  if (
    !description ||
    !amount ||
    !group_id ||
    !paidBy ||
    !splitBetween?.length
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const group = await Group.findById(group_id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const invalidMembers = splitBetween.filter(
      (uid) => !group.members.includes(uid)
    );
    if (invalidMembers.length > 0) {
      return res
        .status(400)
        .json({ message: "One or more users are not in the group" });
    }

    const perPersonAmount = amount / splitBetween.length;
    const userIds = splitBetween.map((id) => new mongoose.Types.ObjectId(id));

    // Step 2: Fetch usernames for all userIds
    const users = await User.find({ _id: { $in: userIds } }).select("name");
    const userMap = new Map(
      users.map((user) => [user._id.toString(), user.name])
    );
    const splits = splitBetween.map((userId) => ({
      userId,
      username: userMap.get(userId.toString()) || "Unknown",
      owed: parseFloat(perPersonAmount.toFixed(2)),
    }));

    const newExpense = new Expense({
      description,
      amount,
      expense_date: expense_date || Date.now(),
      group_id,
      paidBy,
      splitBetween,
      splits,
    });

    await newExpense.save();
    group.total_expense = (group.total_expense || 0) + amount;
    await group.save();
    console.log(newExpense);
    res.status(201).json({
      message: "Expense added successfully!",
      expense: {
        id: newExpense._id,
        description,
        amount,
        date: newExpense.expense_date,
        paidBy,
        splitBetween,
        splits,
      },
    });
  } catch (err) {
    console.error("Error creating expense:", err);
    res
      .status(500)
      .json({ message: "Error adding expense", error: err.message });
  }
});

router.get("", async (req, res) => {
  const groupId = req.query.groupId;
  const userId = req.userId;

  try {
    const expenses = await Expense.find({ group_id: groupId }).populate(
      "paidBy",
      "name email"
    );

    if (!expenses) {
      return res
        .status(404)
        .json({ message: "No expenses found for this group" });
    }

    res.status(200).json(expenses);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching expenses", error: err.message });
  }
});

router.get("/:expenseId", async (req, res) => {
  const expenseId = req.params.expenseId;
  const userId = req.userId;

  try {
    const expense = await Expense.findById(expenseId).populate(
      "paidBy",
      "amount description"
    );
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json(expense);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching expense", error: err.message });
  }
});

router.put("/:expenseId", async (req, res) => {
  const expenseId = req.params.expenseId;
  const { description, amount, expense_date, paidBy, splitBetween } = req.body;

  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      {
        description,
        amount,
        date: expense_date || Date.now(),
        paidBy: paidBy,
        splitBetween: splitBetween,
      },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({
      message: "Expense updated successfully!",
      expense: updatedExpense,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating expense", error: err.message });
  }
});

router.delete("/:expenseId", async (req, res) => {
  const expenseId = req.params.expenseId;

  try {
    const deletedExpense = await Expense.findByIdAndDelete(expenseId);
    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting expense", error: err.message });
  }
});

module.exports = router;
