const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const connectDB = require("./config/db");
require("dotenv").config();
const MongoStore = require("connect-mongo");
const app = express();
connectDB();

app.use(helmet());
const allowedOrigins = [
  "http://localhost:5173",
  "https://backend-production-55e3.up.railway.app",
  "http://localhost:3000",
  "https://tnhs.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use(express.json());

app.use(
  session({
    secret: process.env.JWT_SECRET || "MaoniinyuJWTpleaseChange",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.DB_URI }),
    cookie: { secure: false },
  })
);

const userRoutes = require("./routes/userRoutes");
const LoggedinRoute = require("./routes/LoggedInUserRoute");
const Calendar = require("./routes/CalendarRoutes");
const Subject = require("./routes/SubjectRoutes");
const SectionRoute = require("./routes/SectionRoute");
const announcementRoutes = require("./routes/announcementRoutes");
const examRoutes = require("./routes/examRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const quizRoutes = require("./routes/quizRoutes");
const discussionRoutes = require("./routes/discussionRoute");
const managedByAdmin = require("./routes/AdminManage");
app.use("/api/users", userRoutes);
app.use("/api/LoggedIn", LoggedinRoute);
app.use("/api/calendar", Calendar);
app.use("/api/subject", Subject);
app.use("/api/section", SectionRoute);
app.use("/api/announcements", announcementRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/assignment", assignmentRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/discussion", discussionRoutes);
app.use("/api/manage", managedByAdmin);

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running`);
});
