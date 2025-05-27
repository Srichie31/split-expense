require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/group');
const expenseRoutes = require('./routes/expense');
const userRoutes = require('./routes/user');
const verifyToken = require('./middleware/verifyToken');
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use(verifyToken); // Apply middleware after auth
app.use('/groups', groupRoutes);
app.use('/expenses', expenseRoutes);
app.use('/users', userRoutes);

const port = process.env.PORT || 3000;

// ✅ MongoDB connection using Mongoose
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is listening on port ${port}`);
});
