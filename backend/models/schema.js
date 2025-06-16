const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  total_expense: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Group = mongoose.model("Group", groupSchema);

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  expense_date: { type: Date, default: Date.now },
  splitBetween: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  splits: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      username: {
        type: String,
        required: true,
        min: 0,
      },
      owed: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
});

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = { User, Group, Expense };
