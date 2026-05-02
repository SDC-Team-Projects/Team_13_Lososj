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

/* ---------------- AUTHENTICATION ---------------- */

/* REGISTER */

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
      return res.status(400).json({ error: "Email already exists" });
    }

    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* LOGIN */

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

/* LOGOUT */

app.post("/api/auth/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

/* ---------------- COLLECTIONS ---------------- */

/* CREATE */
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

/* GET ALL */
app.get("/api/collections", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM collections WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* GET BY ID */
app.get("/api/collections/:id", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM collections WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Collection not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* UPDATE */
app.put("/api/collections/:id", auth, async (req, res) => {
  try {
    const { name, description, category, image, is_public } = req.body;

    const result = await pool.query(
      `UPDATE collections
       SET name = $1,
           description = $2,
           category = $3,
           image = $4,
           is_public = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [name, description, category, image, is_public, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Collection not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* DELETE */
app.delete("/api/collections/:id", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM collections WHERE id = $1 AND user_id = $2 RETURNING *",
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Collection not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* GET PUBLIC COLLECTION */

app.get("/api/collections/public/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM collections WHERE id = $1 AND is_public = true",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Collection not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* EXPORT COLLECTION */

app.get("/api/collections/:id/export", auth, async (req, res) => {
  try {
    // пока mock (потом можно PDF сделать)
    const fileUrl = `https://team-13-lososj.onrender.com/exports/collection-${req.params.id}.pdf`;

    res.json({
      file_url: fileUrl
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- ITEMS ---------------- */

/* CREATE ITEM */
app.post("/api/items", auth, async (req, res) => {
  try {
    const {
      collection_id,
      name,
      description,
      notes,
      condition,
      estimated_value,
      categories,
      custom_fields
    } = req.body;

    const result = await pool.query(
      `INSERT INTO items 
      (collection_id, name, description, notes, condition, estimated_value, custom_fields)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [
        collection_id,
        name,
        description,
        notes,
        condition,
        estimated_value,
        custom_fields
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* GET ITEMS BY COLLECTION */
app.get("/api/collections/:id/items", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM items WHERE collection_id = $1 ORDER BY created_at DESC",
      [req.params.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* GET ITEM BY ID */
app.get("/api/items/:id", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM items WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* UPDATE ITEM */
app.put("/api/items/:id", auth, async (req, res) => {
  try {
    const {
      name,
      description,
      notes,
      condition,
      estimated_value,
      custom_fields
    } = req.body;

    const result = await pool.query(
      `UPDATE items
       SET name=$1,
           description=$2,
           notes=$3,
           condition=$4,
           estimated_value=$5,
           custom_fields=$6
       WHERE id=$7
       RETURNING *`,
      [
        name,
        description,
        notes,
        condition,
        estimated_value,
        custom_fields,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* DELETE ITEM */
app.delete("/api/items/:id", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM items WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


/* ---------------- START SERVER ---------------- */

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});
