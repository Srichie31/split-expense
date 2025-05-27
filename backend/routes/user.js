const express = require('express');
const { User } = require('../models/schema'); // Import the User model

const router = express.Router();

// Define route to get user by userId
router.get('', async (req, res) => {
  const userId = req.query.userId;
  console.log(userId)
  try {
    const user = await User.findById(userId).select('name email'); // Fetch only name and email

    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user data' });
  }
});

module.exports = router;
