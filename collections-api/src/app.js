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

/* ---------------- ACTIVITY HELPER ---------------- */

async function addActivity(userId, action, item = null) {
  await pool.query(
    `INSERT INTO activity (user_id, action, item)
     VALUES ($1, $2, $3)`,
    [userId, action, item]
  );
}

/* ---------------- ROOT ---------------- */

app.get("/", (req, res) => {
  res.json({ message: "API работает 🚀" });
});

/* ---------------- AUTHENTICATION ---------------- */

/* REGISTER */

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, username, city, country } = req.body;

    // VALIDATION
    if (!email || !password || !username || !city || !country) {
      return res.status(400).json({
        error: "All fields are required (email, password, username, city, country)",
      });
    }

     
    if (
      !email.trim() ||
      !password.trim() ||
      !username.trim() ||
      !city.trim() ||
      !country.trim()
    ) {
      return res.status(400).json({
        error: "Fields cannot be empty",
      });
    }

     
    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters",
      });
    }

     
    const emailRegex = /\S+@\S+\.\S+/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

     
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

     
    const hashedPassword = await bcrypt.hash(password, 10);

     
    const result = await pool.query(
      `INSERT INTO users (email, password, username, city, country)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, username, city, country`,
      [email, hashedPassword, username, city, country]
    );

    const user = result.rows[0];

     
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

     
    res.json({
      token,
      user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server error"
    });
  }
});

/* LOGIN */

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

// VALIDATION
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

     
    if (!email.trim() || !password.trim()) {
      return res.status(400).json({
        error: "Fields cannot be empty",
      });
    }

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

    // ACTIVITY
    await addActivity(req.user.id, "created collection", name);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* GET ALL PUBLIC COLLECTIONS */

app.get("/api/collections/public", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        collections.*,

        collections.user_id,

        users.username AS owner_name,

        COUNT(items.id) AS items_count,

        COALESCE(SUM(items.estimated_value), 0) AS total_value

      FROM collections

      JOIN users
      ON users.id = collections.user_id

      LEFT JOIN items
      ON items.collection_id = collections.id

      WHERE collections.is_public = true

      GROUP BY collections.id, users.username

      ORDER BY collections.created_at DESC
      `
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* GET ALL */

app.get("/api/collections", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        collections.*,

        COUNT(items.id) AS items_count,

        COALESCE(SUM(items.estimated_value), 0) AS total_value

      FROM collections

      LEFT JOIN items
      ON items.collection_id = collections.id

      WHERE collections.user_id = $1

      GROUP BY collections.id

      ORDER BY collections.created_at DESC
      `,
      [req.user.id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* GET COLLECTION BY ID */

app.get("/api/collections/:id", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        collections.*,

        collections.user_id,

        users.username AS owner_name,

        COUNT(items.id) AS items_count,

        COALESCE(SUM(items.estimated_value), 0) AS total_value

      FROM collections

      JOIN users
      ON users.id = collections.user_id

      LEFT JOIN items
      ON items.collection_id = collections.id

      WHERE collections.id = $1

      GROUP BY collections.id, users.username
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Collection not found"
      });
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

    // ACTIVITY
    await addActivity(req.user.id, "deleted collection", req.params.id);

    res.json({ message: "Deleted successfully" });
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

/* SEARCH COLLECTIONS */

app.get("/api/collections/search", async (req, res) => {
  try {
    const {
      q,
      category,
      min_value,
      max_value,
      sort
    } = req.query;

    let orderBy = "collections.created_at DESC";

    if (sort === "price_asc") {
      orderBy = "total_value ASC";
    }

    if (sort === "price_desc") {
      orderBy = "total_value DESC";
    }

    const result = await pool.query(
      `
      SELECT
        collections.*,

        collections.user_id,

        users.username AS owner_name,

        COUNT(items.id) AS items_count,

        COALESCE(SUM(items.estimated_value), 0) AS total_value

      FROM collections

      JOIN users
      ON users.id = collections.user_id

      LEFT JOIN items
      ON items.collection_id = collections.id

      WHERE
        ($1::text IS NULL OR collections.name ILIKE '%' || $1 || '%')
        AND
        ($2::text IS NULL OR collections.category = $2)

      GROUP BY collections.id, users.username

      HAVING
        COALESCE(SUM(items.estimated_value), 0) >= COALESCE($3, 0)
        AND
        COALESCE(SUM(items.estimated_value), 0) <= COALESCE($4, 999999999)

      ORDER BY ${orderBy}
      `,
      [
        q || null,
        category || null,
        min_value || 0,
        max_value || 999999999
      ]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server error"
    });
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

    // ACTIVITY
    await addActivity(req.user.id, "created item", name);

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

    // ACTIVITY
    await addActivity(req.user.id, "deleted item", req.params.id);

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

/* ADD ITEM TO FAVORITES */
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

/* REMOVE ITEM FROM FAVORITES */
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

/* ADD COLLECTION TO FAVORITES */

app.post("/api/favorites/collections/:collection_id", auth, async (req, res) => {
  try {
    const { collection_id } = req.params;

    const result = await pool.query(
      `INSERT INTO favorite_collections (user_id, collection_id)
       VALUES ($1, $2)
       RETURNING *`,
      [req.user.id, collection_id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* REMOVE COLLECTION FROM FAVORITES */

app.delete("/api/favorites/collections/:collection_id", auth, async (req, res) => {
  try {
    const { collection_id } = req.params;

    const result = await pool.query(
      `DELETE FROM favorite_collections
       WHERE user_id = $1 AND collection_id = $2
       RETURNING *`,
      [req.user.id, collection_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Collection not in favorites"
      });
    }

    res.json({
      message: "Removed from favorites"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* GET FAVORITE COLLECTIONS */

app.get("/api/favorites/collections", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        collections.*,

        collections.user_id,

        users.username AS owner_name,

        COUNT(items.id) AS items_count,

        COALESCE(SUM(items.estimated_value), 0) AS total_value

      FROM favorite_collections

      JOIN collections
      ON favorite_collections.collection_id = collections.id

      JOIN users
      ON users.id = collections.user_id

      LEFT JOIN items
      ON items.collection_id = collections.id

      WHERE favorite_collections.user_id = $1

      GROUP BY collections.id, users.username

      ORDER BY collections.created_at DESC
      `,
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
      `
      SELECT 
        id,
        email,
        username,
        city,
        country,
        bio,
        avatar_url,
        created_at
      FROM users
      WHERE id = $1
      `,
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
    const {
      username,
      city,
      country,
      email,
      bio,
      avatar_url
    } = req.body;

    // validation
    if (!email || !username) {
      return res.status(400).json({
        error: "Email and username are required"
      });
    }

    // email format
    const emailRegex = /\S+@\S+\.\S+/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format"
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET username = $1,
           city = $2,
           country = $3,
           email = $4,
           bio = $5,
           avatar_url = $6
       WHERE id = $7
       RETURNING 
         id,
         email,
         username,
         city,
         country,
         bio,
         avatar_url`,
      [
        username,
        city,
        country,
        email,
        bio,
        avatar_url,
        req.user.id
      ]
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

/* ---------------- ANALYTICS ---------------- */

/* COLLECTION ANALYTICS */
app.get("/api/analytics/collection/:id", auth, async (req, res) => {
  try {
    const collectionId = req.params.id;

    // total items + value
    const stats = await pool.query(
      `
      SELECT 
        COUNT(i.id) AS items_count,
        COALESCE(SUM(i.estimated_value), 0) AS total_value
      FROM items i
      WHERE i.collection_id = $1
      `,
      [collectionId]
    );

    // categories distribution
    const categories = await pool.query(
      `
      SELECT c.name AS category, COUNT(*) AS count
      FROM item_categories ic
      JOIN categories c ON c.id = ic.category_id
      JOIN items i ON i.id = ic.item_id
      WHERE i.collection_id = $1
      GROUP BY c.name
      `,
      [collectionId]
    );

    res.json({
      items_count: stats.rows[0].items_count,
      total_value: stats.rows[0].total_value,
      categories_distribution: categories.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* USER ANALYTICS */
app.get("/api/analytics/user", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const collections = await pool.query(
      "SELECT COUNT(*) FROM collections WHERE user_id = $1",
      [userId]
    );

    const items = await pool.query(
      `
      SELECT COUNT(i.id)
      FROM items i
      JOIN collections c ON c.id = i.collection_id
      WHERE c.user_id = $1
      `,
      [userId]
    );

    const value = await pool.query(
      `
      SELECT COALESCE(SUM(i.estimated_value), 0) AS total_value
      FROM items i
      JOIN collections c ON c.id = i.collection_id
      WHERE c.user_id = $1
      `,
      [userId]
    );

    res.json({
      collections_count: collections.rows[0].count,
      items_count: items.rows[0].count,
      total_value: value.rows[0].total_value
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- ACTIVITY ---------------- */

/* GET ACTIVITY */
  
app.get("/api/activity", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM activity
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- NOTIFICATIONS ---------------- */

async function addNotification(userId, title, message) {
  await pool.query(
    `
    INSERT INTO notifications
    (user_id, title, message)
    VALUES ($1, $2, $3)
    `,
    [userId, title, message]
  );
}

/* GET NOTIFICATIONS */

app.get("/api/notifications", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server error"
    });
  }
});

/* ---------------- ADMIN ---------------- */

/* BAN USER */
app.post("/api/admin/users/:id/ban", auth, async (req, res) => {
  try {
     
    const me = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [req.user.id]
    );

    if (me.rows[0].role !== "ADMIN") {
      return res.status(403).json({ error: "No access" });
    }

    const { type, until } = req.body;

    await pool.query(
      `UPDATE users
       SET status = 'banned'
       WHERE id = $1`,
      [req.params.id]
    );

    res.json({
      message: "User banned",
      type,
      until: until || null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});




/* ---------------- START SERVER ---------------- */

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});
