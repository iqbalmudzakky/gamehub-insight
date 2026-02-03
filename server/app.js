if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");

const router = require("./routes/index");
const { errorHandler } = require("./middleware/errorHandler");
const app = express();

// CORS configuration
// const corsOptions = {
//   origin: [
//     "http://localhost:5173", // Vite dev
//     "http://localhost:5174",
//     "https://gamehub-insight-f9114.web.app", // Firebase hosting
//     "https://gamehub-insight-f9114.firebaseapp.com",
//   ],
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// };
// app.use(cors(corsOptions));
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.use(errorHandler);

module.exports = app;
