




const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;
const JWT_SECRET = "supersecretkey";
const MONGO_URI = "mongodb://localhost:27017/authSystem";

app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(MONGO_URI)
.then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

// ✅ User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});
const User = mongoose.model("User", UserSchema);

// ✅ Diary Entry Schema
const EntrySchema = new mongoose.Schema({
  userId: String,  // ✅ Replace name with userId
  mood: String,
  date: String,
  text: String
});


const Entry = mongoose.model("Entry", EntrySchema);

// ✅ Signup Route
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup error" });
  }
});

// ✅ Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, userId: user._id, name: user.name });
  } catch (err) {
    res.status(500).json({ message: "Login error" });
  }
});

// ✅ Middleware to verify token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// ✅ Add Entry (Authenticated)
app.post("/api/entry", authenticate, async (req, res) => {
  const { mood, date, text } = req.body;
  const userId = req.user?.id;

  if (!mood || !date || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newEntry = new Entry({ userId, mood, date, text }); // ✅ use userId
    await newEntry.save();
    res.status(201).json({ message: "Entry saved successfully!" });
  } catch (err) {
    console.error("❌ Error saving entry:", err);
    res.status(500).json({ message: "Failed to save entry" });
  }
});

// ✅ Get All Entries (Authenticated, Only for Current User)
app.get("/api/entries", authenticate, async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.user.id }).sort({ _id: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

// ✅ Get Profile Info
app.get("/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("name email");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ name: user.name, email: user.email });
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

app.delete('/api/entry/:id', authenticate, async (req, res) => {
  const entryId = req.params.id;
  const userId = req.user.id; // ✅ Fix this

  try {
    const entry = await Entry.findById(entryId);
    if (!entry || entry.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this entry.' });
    }

    await Entry.findByIdAndDelete(entryId);
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// // File: backend/server.js
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const jwt = require('jsonwebtoken');

// dotenv.config();
// const app = express();

// app.use(cors());
// app.use(express.json());

// // Connect MongoDB
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('✅ MongoDB connected'))
//   .catch(err => console.error('❌ MongoDB error:', err));

// // Simple login route to generate token
// app.post('/api/login', (req, res) => {
//   const user = { id: 'kid123' }; // Replace with dynamic user if needed
//   const token = jwt.sign(user, process.env.JWT_SECRET);
//   res.json({ token });
// });

// // Routes
// const entryRoutes = require('./routes/entryRoutes');
// app.use('/api', entryRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


// // File: backend/.env
// PORT=5000
// MONGO_URI=mongodb;//localhost:27017/childdiary
// JWT_SECRET=supersecretkey123


// // File: backend/models/Entry.js
// const mongoose = require('mongoose');

// const entrySchema = new mongoose.Schema({
//   name: String,
//   mood: String,
//   date: String,
//   text: String,
//   userId: String,
// });

// module.exports = mongoose.model('Entry', entrySchema);


// // File: backend/middleware/authMiddleware.js
// const jwt = require('jsonwebtoken');

// const authenticate = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   if (!authHeader) return res.status(401).json({ message: 'Token missing' });

//   const token = authHeader.split(' ')[1];
//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(403).json({ message: 'Invalid token' });
//     req.userId = decoded.id;
//     next();
//   });
// };

// module.exports = authenticate;


// // File: backend/routes/entryRoutes.js
// const express = require('express');
// const Entry = require('../models/Entry');
// const authenticate = require('../middleware/authMiddleware');

// const router = express.Router();

// router.post('/entry', authenticate, async (req, res) => {
//   const { name, mood, date, text } = req.body;
//   try {
//     const newEntry = new Entry({ name, mood, date, text, userId: req.userId });
//     await newEntry.save();
//     res.json({ message: 'Entry saved successfully!' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error saving entry' });
//   }
// });

// router.get('/entries', authenticate, async (req, res) => {
//   try {
//     const entries = await Entry.find({ userId: req.userId }).sort({ date: -1 });
//     res.json(entries);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching entries' });
//   }
// });

// router.delete('/entry/:id', authenticate, async (req, res) => {
//   try {
//     await Entry.findOneAndDelete({ _id: req.params.id, userId: req.userId });
//     res.json({ message: 'Entry deleted successfully!' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error deleting entry' });
//   }
// });

// module.exports = router;
