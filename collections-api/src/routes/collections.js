const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

// middleware проверки токена
function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: "No token" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

//---

//  CREATE COLLECTION
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, category, image, is_public } = req.body;

    const result = await pool.query(
      `INSERT INTO collections 
      (user_id, name, description, category, image, is_public)
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

//---

//#  GET ALL COLLECTIONS (user)
router.get("/", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM collections WHERE user_id = $1",
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

//---

//#  GET BY ID
router.get("/:id", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM collections WHERE id = $1",
      [req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

//---

//#  UPDATE
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    const result = await pool.query(
      `UPDATE collections
       SET name = $1, description = $2
       WHERE id = $3
       RETURNING *`,
      [name, description, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

//---

//# 🟢 DELETE
router.delete("/:id", auth, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM collections WHERE id = $1",
      [req.params.id]
    );

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
