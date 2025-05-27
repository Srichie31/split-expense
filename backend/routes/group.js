const express = require("express");
const mongoose = require("mongoose");
const { Group } = require("../models/schema");
const { Expense } = require("../models/schema");
const { User } = require("../models/schema");

const router = express.Router();

router.get("/", async (req, res) => {
  const userId = req.userId;
  try {
    const groups = await Group.find({ members: userId })
      .populate("members", "name email")
      .exec();

    if (!groups || groups.length === 0) {
      return res.status(404).json({ message: "No groups found for this user" });
    }

    res.status(200).json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error retrieving groups" });
  }
});

router.get("/:groupId", async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.userId;
  try {
    const group = await Group.findById(groupId).populate(
      "members",
      "name email"
    );
    const isMember = group.members.some((memberId) => memberId.equals(userId));

    if (!group || !isMember) {
      return res
        .status(404)
        .json({ message: "Group not found or you are not a member" });
    }

    res.status(201).json(group);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error occurred while fetching the Group" });
  }
});

//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

router.get("/:group_id/summary", async (req, res) => {
  const groupId = req.params.group_id;
  const group = await Group.findById(groupId)

  try {
    const expenses = await Expense.find({ group_id: groupId });

    let totalExpenses = 0;
    let userBalances = {};

    //
    expenses.forEach((expense) => {
      totalExpenses += expense.amount;

      const splitMembers = expense.splitBetween.filter(
        (userId) => String(userId) !== String(expense.paidBy)
      );
      const perPersonAmount =
        splitMembers.length > 0 ? expense.amount / splitMembers.length : 0;

      splitMembers.forEach((userId) => {
        if (!userBalances[userId]) {
          userBalances[userId] = { settlements: [] };
        }

        userBalances[userId].settlements.push({
          to: expense.paidBy,
          amount: perPersonAmount,
        });
      });

      if (!userBalances[expense.paidBy]) {
        userBalances[expense.paidBy] = { settlements: [] };
      }
      splitMembers.forEach((userId) => {
        userBalances[expense.paidBy].settlements.push({
          from: userId,
          amount: perPersonAmount,
        });
      });
    });

    const userIds = Object.keys(userBalances);
    const users = await User.find({ _id: { $in: userIds } }).select("name");
    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = u.name;
    });

    const groupSummary = [];
    for (const userId in userBalances) {
      const userBalance = userBalances[userId];

      let owed = 0;
      let paid = 0;
      const settlementsWithNames = userBalance.settlements.map((settlement) => {
        if (settlement.to) {
          owed += settlement.amount;
          return {
            to: settlement.to,
            amount: settlement.amount,
            toName: userMap[settlement.to],
          };
        } else if (settlement.from) {
          paid += settlement.amount;
          return {
            from: settlement.from,
            amount: settlement.amount,
            fromName: userMap[settlement.from],
          };
        }
      });

      const netBalance = (paid - owed).toFixed(2);

      groupSummary.push({
        userId,
        user: userMap[userId],
        paid: paid.toFixed(2),
        owed: owed.toFixed(2),
        balance: netBalance,
        settlements: settlementsWithNames,
      });
    }

    res.status(200).json({
      groupId,
      createdBy: userMap[group['createdBy']],
      createdAt: group['createdAt'],
      totalExpenses: totalExpenses.toFixed(2),
      groupSummary,
    });
  } catch (err) {
    console.error("Error calculating group summary:", err);
    res
      .status(500)
      .json({ message: "Error fetching group summary", error: err.message });
  }
});

router.post("/create", async (req, res) => {
  const { name } = req.body;
  const userId = req.userId;

  try {
    const group = new Group({
      name,
      members: [userId],
      createdBy: userId,
      total_expense: 0,
    });

    await group.save();
    res.status(201).json({ groupId: group._id });
  } catch (err) {
    res.status(500).json({ error: "Error creating group" });
  }
});

router.post("/:groupId/add-member", async (req, res) => {
  const { groupId } = req.params;
  const { newMemberId } = req.body;
  const userId = req.userId;

  try {
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(userId)) {
      return res
        .status(404)
        .json({ message: "Group not found or you are not a member" });
    }

    if (group.members.includes(newMemberId)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    group.members.push(newMemberId);
    await group.save();

    res.status(201).json({ message: "Member added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error adding member" });
  }
});

router.get("/:groupId/members", async (req, res) => {
  const { groupId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({ message: "Invalid group ID" });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const members = await User.find(
      { _id: { $in: group.members } },
      { name: 1, email: 1 }
    );

    res.status(200).json(members);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/:groupId/members", async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.userId;

  try {
    const group = await Group.findById(groupId).populate(
      "members",
      "name email"
    );
    if (!group || !group.members.includes(userId)) {
      return res
        .status(404)
        .json({ message: "Group not found or you are not a member" });
    }

    res.status(200).json(group.members);
  } catch (err) {
    res.status(500).json({ message: "Error fetching members" });
  }
});

router.post("/:groupId/members", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;

    if (!Array.isArray(memberIds)) {
      return res.status(400).json({ error: "memberIds must be an array" });
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: { $each: memberIds } } },
      { new: true }
    );

    if (!updatedGroup)
      return res.status(404).json({ error: "Group not found" });

    res.status(200).json(updatedGroup);
  } catch (err) {
    res.status(500).json({ error: "Failed to add members" });
  }
});

router.delete("/:groupId/members/:memberId", async (req, res) => {
  const { groupId, memberId } = req.params;
  const userId = req.userId;

  try {
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(userId)) {
      return res
        .status(404)
        .json({ message: "Group not found or you are not a member" });
    }

    group.members = group.members.filter(
      (member) => member.toString() !== memberId
    );
    await group.save();
    res.status(200).json({ message: "Member removed from group successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error removing member" });
  }
});

router.delete("/:groupId", async (req, res) => {
  const groupId = req.params.groupId;

  try {
    const group = await Group.findByIdAndDelete(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting group" });
  }
});

router.put("/:groupId", async (req, res) => {
  const groupId = req.params.groupId;
  const { name } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group.name = name;
    await group.save();

    res.status(200).json({ message: "Group updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error updating group" });
  }
});

router.get("/:groupId/nonmembers", async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({ message: "Invalid group ID" });
  }

  try {
    const group = await Group.findOne({ _id: groupId, members: userId });
    if (!group) {
      return res
        .status(404)
        .json({ message: "Group not found or access denied" });
    }

    const nonMembers = await User.find({ _id: { $nin: group.members } }).select(
      "_id name"
    );

    res.status(200).json(nonMembers);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
