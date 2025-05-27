const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models/schema"); // Import the User model from index.js

const router = express.Router();

// Register endpoint
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  // Check if the email already exists in the database
  User.findOne({ email: email })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(400).json({ message: "EMAIL_EXISTS" });
      }

      // Hash the password
      bcrypt.hash(password, 12, (err, hashedPassword) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Error during password hashing" });
        }

        // Create a new user instance
        const newUser = new User({
          name,
          email,
          password: hashedPassword,
        });

        // Save the user to the database
        newUser
          .save()
          .then((user) => {
            // Create a JWT token
            const token = jwt.sign(
              { userId: user._id },
              process.env.JWT_SECRET_KEY,
              {
                expiresIn: "1h",
              }
            );

            // Get the expiration time in seconds
            const expiresIn = jwt.decode(token).exp;

            return res
              .status(200)
              .json({ userId: user._id, name, email, token, expiresIn });
          })
          .catch((error) => {
            return res
              .status(500)
              .json({ error: "Error during user registration" });
          });
      });
    })
    .catch((error) => {
      return res.status(500).json({ error: "Error during email check" });
    });
});

// Login endpoint
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "INVALID_CREDENTIALS" });
      }

      // Compare password hash
      bcrypt.compare(password, user.password, (err, match) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Error during password comparison" });
        }

        if (!match) {
          return res.status(401).json({ message: "INVALID_CREDENTIALS" });
        }

        // Create a JWT token
        const token = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "1h",
          }
        );

        // Get the expiration time in seconds
        const expiresIn = jwt.decode(token).exp;

        return res
          .status(200)
          .json({
            userId: user._id,
            name: user.name,
            email: user.email,
            token,
            expiresIn,
          });
      });
    })
    .catch((error) => {
      return res.status(500).json({ error: "Error during user login" });
    });
});

module.exports = router;
