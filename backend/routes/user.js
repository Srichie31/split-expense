const express = require("express");
const { User } = require("../models/schema");

const router = express.Router();

router.get("", async (req, res) => {
  const userId = req.query.userId;
  console.log(userId);
  try {
    const user = await User.findById(userId).select("name email");

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Error fetching user data" });
  }
});

module.exports = router;
