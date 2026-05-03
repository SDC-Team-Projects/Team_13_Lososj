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

/* ---------------- PHOTO ---------------- */

/* ADD PHOTO */
app.post("/api/items/:id/photos", auth, async (req, res) => {
  try {
    const { url } = req.body;

    const result = await pool.query(
      `INSERT INTO photos (item_id, url)
       VALUES ($1, $2)
       RETURNING *`,
      [req.params.id, url]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* DELETE PHOTO */
app.delete("/api/photos/:id", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM photos WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Photo not found" });
    }

    res.json({ message: "Photo deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- FAVORITES ---------------- */

/* ADD TO FAVORITES */
app.post("/api/favorites/:item_id", auth, async (req, res) => {
  try {
    const { item_id } = req.params;

    const result = await pool.query(
      `INSERT INTO favorites (user_id, item_id)
       VALUES ($1, $2)
       RETURNING *`,
      [req.user.id, item_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* REMOVE FROM FAVORITES */
app.delete("/api/favorites/:item_id", auth, async (req, res) => {
  try {
    const { item_id } = req.params;

    const result = await pool.query(
      `DELETE FROM favorites
       WHERE user_id = $1 AND item_id = $2
       RETURNING *`,
      [req.user.id, item_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Not in favorites" });
    }

    res.json({ message: "Removed from favorites" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* GET FAVORITES */
app.get("/api/favorites", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT items.*
       FROM favorites
       JOIN items ON favorites.item_id = items.id
       WHERE favorites.user_id = $1`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- PROFILE ---------------- */

/* GET PROFILE */
app.get("/api/profile", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, username, city, country, created_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* UPDATE PROFILE */
app.put("/api/profile", auth, async (req, res) => {
  try {
    const { username, city, country } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET username = $1,
           city = $2,
           country = $3
       WHERE id = $4
       RETURNING id, email, username, city, country`,
      [username, city, country, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* CHANGE PASSWORD */
app.put("/api/profile/password", auth, async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    const userResult = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [req.user.id]
    );

    const user = userResult.rows[0];

    const validPassword = await bcrypt.compare(old_password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Wrong old password" });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, req.user.id]
    );

    res.json({ message: "Password updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* REQUEST RESET PASSWORD */
app.post("/api/auth/password-reset/request", async (req, res) => {
  try {
    const { email } = req.body;

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    
    const resetToken = "RESET_TOKEN_123";

    res.json({
      message: "Password reset link sent",
      token: resetToken   // 👈 для теста
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* CONFIRM RESET PASSWORD */
app.post("/api/auth/password-reset/confirm", async (req, res) => {
  try {
    const { token, new_password, confirm_new_password } = req.body;

    if (new_password !== confirm_new_password) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

     
    if (token !== "RESET_TOKEN_123") {
      return res.status(400).json({ error: "Invalid token" });
    }

     
    const hashedPassword = await bcrypt.hash(new_password, 10);

    await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, 1]
    );

    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- START SERVER ---------------- */

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});
