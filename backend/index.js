require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const groupRoutes = require("./routes/group");
const expenseRoutes = require("./routes/expense");
const userRoutes = require("./routes/user");
const verifyToken = require("./middleware/verifyToken");

const app = express();
app.use(express.json());

app.use(cors());
app.options("*", cors());

app.use("/auth", authRoutes);
app.use(verifyToken);
app.use("/groups", groupRoutes);
app.use("/expenses", expenseRoutes);
app.use("/users", userRoutes);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB error:", err));

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

