require("dotenv").config();
const express = require("express");
const router = require("./routes/index");
const { errorHandler } = require("./middleware/errorHandler");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.use(errorHandler);

module.exports = app;

/**
🧾 User Routes (Opsional untuk Admin/Profil)
| Method   | Endpoint     | Deskripsi                         |
| -------- | ------------ | --------------------------------- |
| `GET`    | `/users`     | (Admin only) Ambil semua user     |
| `GET`    | `/users/:id` | Lihat detail user tertentu        |
| `DELETE` | `/users/:id` | Hapus user (opsional, admin only) |
 */
