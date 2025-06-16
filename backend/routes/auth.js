const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models/schema");

const router = express.Router();

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  User.findOne({ email: email })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(400).json({ message: "EMAIL_EXISTS" });
      }

      bcrypt.hash(password, 12, (err, hashedPassword) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Error during password hashing" });
        }

        const newUser = new User({
          name,
          email,
          password: hashedPassword,
        });

        newUser
          .save()
          .then((user) => {
            const token = jwt.sign(
              { userId: user._id },
              process.env.JWT_SECRET_KEY,
              {
                expiresIn: "1h",
              }
            );

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

router.options("/login", (req, res) => {
  res.sendStatus(200); 
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "INVALID_CREDENTIALS" });
      }

      bcrypt.compare(password, user.password, (err, match) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Error during password comparison" });
        }

        if (!match) {
          return res.status(401).json({ message: "INVALID_CREDENTIALS" });
        }

        const token = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "1h",
          }
        );

        const expiresIn = jwt.decode(token).exp;

        return res.status(200).json({
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
