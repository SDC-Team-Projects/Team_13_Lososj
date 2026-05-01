require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const auth = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

/* ---------------- ROOT ---------------- */

app.get("/", (req, res) => {
  res.json({ message: "API работает 🚀" });
});

/* ---------------- REGISTER ---------------- */

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, username, city, country } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password, username, city, country)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, username`,
      [email, hashedPassword, username, city, country]
    );

    res.json(result.rows[0]);

  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({
        error: "Email already exists"
      });
    }

    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- LOGIN ---------------- */

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- COLLECTION ---------------- */

app.post("/api/collections", auth, async (req, res) => {
  try {
    const { name, description, category, image, is_public } = req.body;

    const result = await pool.query(
      `INSERT INTO collections (user_id, name, description, category, image, is_public)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, name, description, category, image, is_public]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/api/collections", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM collections WHERE user_id = $1",
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/api/collections/:id", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM collections WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


app.delete("/api/collections/:id", auth, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM collections WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- START SERVER ---------------- */

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});