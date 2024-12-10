const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "MaoniinyuJWTpleaseChange";

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    console.log("User status:", user.status); // Debugging log

    if (user.status.toLowerCase() === "request".toLowerCase()) {
      return res.status(403).json({ error: "Account is not yet approved" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    req.session.token = token;
    console.log("Generated token", token);
    res.status(200).json({ token, role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.signup = async (req, res) => {
  console.log("Request Body:", req.body); // Log payload for debugging

  const { name, username, idNumber, email, password, lrn } = req.body;

  try {
    if (!name || !username || !idNumber || !email || !password || !lrn) {
      return res.status(400).json({
        error:
          "Name, username, idNumber, email, password, and LRN are required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      username,
      idNumber,
      email,
      password: hashedPassword,
      LRN: lrn, // Ensure this is being passed into the database schema
      role: "student",
      status: "Request",
    });

    console.log("User Payload to Save:", user);

    await user.save();

    res.status(201).json({
      message: "User created successfully",
      status: "requested",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
};
