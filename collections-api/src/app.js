require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const auth = require("./middleware/auth");
const PDFDocument = require("pdfkit");
const axios = require("axios");
const crypto = require("crypto");
const sharp = require("sharp");
const transporter = require("./mailer");

const app = express();


app.use(cors());
app.use(express.json());



app.get("/test-images", async (req, res) => {

  const result = await pool.query(
    "SELECT image FROM collections"
  );

  res.json(result.rows);
});


async function fetchImageAsPngBuffer(url) {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 10000,
  });

  const inputBuffer = Buffer.from(response.data);

  const outputBuffer = await sharp(inputBuffer)
    .png()
    .toBuffer();

  return outputBuffer;
}


/* ---------------- ANALYTICS HELPER ---------------- */

async function addAnalytics({ userId, collectionId, itemId, changeAmount, totalValue, action }) {
  await pool.query(
    `
    INSERT INTO analytics_history
    (user_id, collection_id, item_id, change_amount, total_value, action)
    VALUES ($1,$2,$3,$4,$5,$6)
    `,
    [userId, collectionId, itemId, changeAmount, totalValue, action]
  );
}

/* ---------------- ACTIVITY HELPER ---------------- */

async function addActivity(userId, action, item = null) {
  await pool.query(
    `INSERT INTO activity (user_id, action, item)
     VALUES ($1, $2, $3)`,
    [userId, action, item]
  );
}


/* ---------------- VIEWS HELPER ---------------- */

async function addViewHistory(userId, itemId = null, collectionId = null) {
  await pool.query(
    `
    INSERT INTO views_history
    (user_id, item_id, collection_id)
    VALUES ($1, $2, $3)
    `,
    [userId, itemId, collectionId]
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
      `INSERT INTO users (
        email,
        password,
        username,
        city,
        country
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        email,
        username,
        city,
        country,
        role,
        status,
        created_at`,
      [
        email,
        hashedPassword,
        username,
        city,
        country
      ]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
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

    
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    if (!email.trim() || !password.trim()) {
      return res.status(400).json({
        error: "Fields cannot be empty"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

   
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [normalizedEmail]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

     
    if (user.status !== "active") {
      return res.status(403).json({
        error: "User is banned"
      });
    }

    
    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        error: "Wrong password"
      });
    }

     
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || "USER"
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

     
    res.json({
      token,

      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        city: user.city,
        country: user.country,
        role: user.role || "USER",
        status: user.status,
        bio: user.bio,
        avatar_url: user.avatar_url,
        created_at: user.created_at
      }
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error"
    });
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

    await addNotification(
    req.user.id,
  "Collection created",
  `Collection "${name}" was created`
);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* PUBLIC COLLECTION WITH ITEMS */

app.get("/api/public/collections/:id", async (req, res) => {
  try {
    const collectionResult = await pool.query(
      `
      SELECT
        collections.*,
        users.username AS owner_name,
        users.avatar_url AS owner_avatar,
        COUNT(items.id) AS items_count,
        COALESCE(SUM(items.estimated_value), 0) AS total_value
      FROM collections
      JOIN users ON users.id = collections.user_id
      LEFT JOIN items ON items.collection_id = collections.id
      WHERE collections.id = $1
        AND collections.is_public = true
      GROUP BY collections.id, users.id
      `,
      [req.params.id]
    );

    if (collectionResult.rows.length === 0) {
      return res.status(404).json({ error: "Collection not found" });
    }

    const itemsResult = await pool.query(
      `
      SELECT
        items.*,
        collections.user_id,
        users.username AS owner_name,
        users.avatar_url AS owner_avatar
      FROM items
      JOIN collections ON collections.id = items.collection_id
      JOIN users ON users.id = collections.user_id
      WHERE items.collection_id = $1
      ORDER BY items.created_at DESC
      `,
      [req.params.id]
    );

    const items = itemsResult.rows.map(item => {
      let cf = item.custom_fields;
      if (!cf || typeof cf !== "object") cf = {};

      if (item.image && !cf.image) {
        cf.image = item.image;
      }

      return {
        ...item,
        custom_fields: cf
      };
    });

    res.json({
      collection: collectionResult.rows[0],
      items
    });

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
        users.avatar_url AS owner_avatar,
        COUNT(items.id) AS items_count,
        COALESCE(SUM(items.estimated_value), 0) AS total_value
      FROM collections
      JOIN users ON users.id = collections.user_id
      LEFT JOIN items ON items.collection_id = collections.id
      WHERE collections.is_public = true
      GROUP BY collections.id, users.id
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
        users.username AS owner_name,
        users.avatar_url AS owner_avatar,
        COUNT(items.id) AS items_count,
        COALESCE(SUM(items.estimated_value), 0) AS total_value
      FROM collections
      JOIN users ON users.id = collections.user_id
      LEFT JOIN items ON items.collection_id = collections.id
      WHERE collections.user_id = $1
      GROUP BY collections.id, users.id
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

/* GET COLLECTION BY ID */
app.get("/api/collections/:id", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        collections.*,
        collections.user_id,
        users.username AS owner_name,
        users.avatar_url AS owner_avatar,
        COUNT(items.id) AS items_count,
        COALESCE(SUM(items.estimated_value), 0) AS total_value
      FROM collections
      JOIN users
        ON users.id = collections.user_id
      LEFT JOIN items
        ON items.collection_id = collections.id
      WHERE collections.id = $1
      GROUP BY collections.id, users.id
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Collection not found"
      });
    }

    const collection = result.rows[0];

    await addViewHistory(
      req.user.id,
      null,
      collection.id
    );

    res.json(collection);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


/* GET COLLECTION BY ID WITHOUT AUTHORIZATION */
app.get("/api/public/collections/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        collections.*,
        collections.user_id,
        users.username AS owner_name,
        users.avatar_url AS owner_avatar,
        COUNT(items.id) AS items_count,
        COALESCE(SUM(items.estimated_value), 0) AS total_value
      FROM collections
      JOIN users
        ON users.id = collections.user_id
      LEFT JOIN items
        ON items.collection_id = collections.id
      WHERE collections.id = $1
        AND collections.is_public = true
      GROUP BY collections.id, users.id
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Collection not found or not public"
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

/* EXPORT COLLECTION PDF */

app.get("/api/collections/:id/export", auth, async (req, res) => {
  try {

    const collectionResult = await pool.query(
      `
      SELECT collections.*, users.username AS owner_name
      FROM collections
      JOIN users ON users.id = collections.user_id
      WHERE collections.id = $1
      `,
      [req.params.id]
    );

    if (collectionResult.rows.length === 0) {
      return res.status(404).json({ error: "Collection not found" });
    }

    const collection = collectionResult.rows[0];

    const itemsResult = await pool.query(
      `
      SELECT *
      FROM items
      WHERE collection_id = $1
      ORDER BY created_at DESC
      `,
      [req.params.id]
    );

    const items = itemsResult.rows;

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=collection-${collection.id}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // TITLE
    doc.fontSize(24).text(collection.name);
    doc.moveDown();

    doc.fontSize(14).text(`Owner: ${collection.owner_name}`);
    doc.text(`Category: ${collection.category || "Unknown"}`);
    doc.text(`Description: ${collection.description || "-"}`);
    doc.moveDown();

     
    // COLLECTION IMAGE (FIXED LAYOUT SAFE)
if (collection.image && collection.image.startsWith("http")) {
  try {

    const buffer = await fetchImageAsPngBuffer(collection.image);

    
    const imageY = doc.y;

    doc.image(buffer, {
      fit: [400, 300],
      align: "center"
    });

     
    doc.y = imageY + 320;

    doc.moveDown();

  } catch (e) {
    console.log("Collection image error:", e.message);
    doc.text("Collection image could not be loaded");
    doc.moveDown();
  }
}

    // ITEMS
    doc.fontSize(18).text("Items");
    doc.moveDown();

    let totalValue = 0;

    for (const [index, item] of items.entries()) {

      totalValue += Number(item.estimated_value || 0);

      doc.fontSize(16).text(`${index + 1}. ${item.name}`);
      doc.fontSize(12).text(`Estimated value: ${item.estimated_value || 0}`);
      doc.text(`Condition: ${item.condition || "-"}`);
      doc.text(`Description: ${item.description || "-"}`);

      // ITEM IMAGE
if (item.image && item.image.startsWith("http")) {
  try {
    const buffer = await fetchImageAsPngBuffer(item.image);

    const imageY = doc.y;

    doc.image(buffer, {
      fit: [300, 250],
      align: "center"
    });

    doc.y = imageY + 270;
    doc.moveDown();

  } catch (e) {
    console.log("Item image error:", e.message);
    doc.text("Item image could not be loaded");
    doc.moveDown();
  }
}

      doc.moveDown();
    }

    doc.moveDown();
    doc.fontSize(18).text(`Total collection value: ${totalValue}`);

    doc.end();

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
      image,
      condition,
      estimated_value
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO items
      (collection_id, name, description, notes, image, condition, estimated_value)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        collection_id,
        name,
        description,
        notes,
        image || null,
        condition,
        estimated_value
      ]
    );

    const item = result.rows[0];

    const totalValueResult = await pool.query(
      `
      SELECT COALESCE(SUM(i.estimated_value), 0) AS total_value
      FROM items i
      JOIN collections c ON c.id = i.collection_id
      WHERE c.user_id = $1
      `,
      [req.user.id]
    );

    await addAnalytics({
      userId: req.user.id,
      collectionId: collection_id,
      itemId: item.id,
      changeAmount: Number(estimated_value || 0),
      totalValue: Number(totalValueResult.rows[0].total_value),
      action: "create_item"
    });

    await addActivity(req.user.id, "created item", name);

    res.json(item);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


/* GET ITEMS BY COLLECTION */
/*app.get("/api/collections/:id/items", auth, async (req, res) => {
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
});*/

app.get("/api/collections/:id/items", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM items WHERE collection_id = $1 ORDER BY created_at DESC",
      [req.params.id]
    );
    
    const patchedRows = result.rows.map(item => {
      let cf = item.custom_fields;
      if (!cf || typeof cf !== 'object') {
        cf = {};
      }
      
      if (item.image && !cf.image) {
        cf.image = item.image;
      }
      
      return {
        ...item,
        custom_fields: cf
      };
    });

    res.json(patchedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* GET ITEMS BY ID */
/*app.get("/api/items/:id", auth, async (req, res) => {
  try {

    const result = await pool.query(
      `
      SELECT
        items.*,
        collections.user_id,
        users.username AS owner_name

      FROM items

      JOIN collections
      ON collections.id = items.collection_id

      JOIN users
      ON users.id = collections.user_id

      WHERE items.id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const item = result.rows[0];

    await addViewHistory(req.user.id, item.id, null);

    res.json(item);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});*/

app.get("/api/items/:id", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        items.*,
        collections.user_id,
        users.username AS owner_name

      FROM items

      JOIN collections
      ON collections.id = items.collection_id

      JOIN users
      ON users.id = collections.user_id

      WHERE items.id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const item = result.rows[0];

    let cf = item.custom_fields;
    if (!cf || typeof cf !== 'object') {
      cf = {};
    }
    if (item.image && !cf.image) {
      cf.image = item.image;
    }
    item.custom_fields = cf;

    await addViewHistory(req.user.id, item.id, null);

    res.json(item);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* GET PUBLIC ITEM BY ID */
app.get("/api/public/items/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        items.*,
        collections.user_id,
        collections.is_public,
        users.username AS owner_name

      FROM items

      JOIN collections
        ON collections.id = items.collection_id

      JOIN users
        ON users.id = collections.user_id

      WHERE items.id = $1
        AND collections.is_public = true
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const item = result.rows[0];

     
    let cf = item.custom_fields;

    if (!cf || typeof cf !== "object") {
      cf = {};
    }

    if (item.image && !cf.image) {
      cf.image = item.image;
    }

    item.custom_fields = cf;

    res.json(item);

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
      image,
      condition,
      estimated_value
    } = req.body;

    const oldItemResult = await pool.query(
      "SELECT * FROM items WHERE id = $1",
      [req.params.id]
    );

    if (oldItemResult.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const oldItem = oldItemResult.rows[0];

    const ownerCheck = await pool.query(
      `
      SELECT c.user_id
      FROM collections c
      JOIN items i ON i.collection_id = c.id
      WHERE i.id = $1
      `,
      [req.params.id]
    );

    if (ownerCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: "No access" });
    }

    const result = await pool.query(
      `
      UPDATE items
      SET name=$1,
          description=$2,
          notes=$3,
          image=$4,
          condition=$5,
          estimated_value=$6
      WHERE id=$7
      RETURNING *
      `,
      [
        name,
        description,
        notes,
        image || null,
        condition,
        estimated_value,
        req.params.id
      ]
    );

    const updatedItem = result.rows[0];

    const diff =
      Number(updatedItem.estimated_value) -
      Number(oldItem.estimated_value);

    if (diff !== 0) {

      const totalValueResult = await pool.query(
        `
        SELECT COALESCE(SUM(i.estimated_value), 0) AS total_value
        FROM items i
        JOIN collections c ON c.id = i.collection_id
        WHERE c.user_id = $1
        `,
        [req.user.id]
      );

      await addAnalytics({
        userId: req.user.id,
        collectionId: updatedItem.collection_id,
        itemId: updatedItem.id,
        changeAmount: diff,
        totalValue: Number(totalValueResult.rows[0].total_value),
        action: "update_item"
      });
    }

    res.json(updatedItem);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* DELETE ITEM */
app.delete("/api/items/:id", auth, async (req, res) => {
  try {

    const itemResult = await pool.query(
      `
      SELECT
        items.*,
        collections.user_id
      FROM items
      JOIN collections ON collections.id = items.collection_id
      WHERE items.id = $1
      `,
      [req.params.id]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const item = itemResult.rows[0];

    if (item.user_id !== req.user.id) {
      return res.status(403).json({ error: "No access" });
    }

    await pool.query(
      "DELETE FROM items WHERE id = $1",
      [req.params.id]
    );

    const totalValueResult = await pool.query(
      `
      SELECT COALESCE(SUM(i.estimated_value), 0) AS total_value
      FROM items i
      JOIN collections c ON c.id = i.collection_id
      WHERE c.user_id = $1
      `,
      [req.user.id]
    );

    await addAnalytics({
      userId: req.user.id,
      collectionId: item.collection_id,
      itemId: item.id,
      changeAmount: -Number(item.estimated_value || 0),
      totalValue: Number(totalValueResult.rows[0].total_value),
      action: "delete_item"
    });

    await addActivity(req.user.id, "deleted item", item.name);

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

/* GET USER PROFILE BY ID */

app.get("/api/users/:id", async (req, res) => {
  try {

    const result = await pool.query(
      `
      SELECT
        id,
        username,
        city,
        country,
        bio,
        avatar_url,
        created_at
      FROM users
      WHERE id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error"
    });
  }
});

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

/* FORGOT PASSWORD */
app.post("/api/forgot-password", async (req, res) => {
  try {

    const { email } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

     
    if (result.rows.length === 0) {
      return res.json({
        message: "If the email exists, a reset link has been sent."
      });
    }

    const user = result.rows[0];

    const token = crypto.randomBytes(32).toString("hex");

    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      `
      UPDATE users
      SET
        reset_token = $1,
        reset_token_expires = $2
      WHERE id = $3
      `,
      [
        token,
        expires,
        user.id
      ]
    );

    const resetLink =
      `${process.env.CLIENT_URL}/reset-password/${token}`;

    await transporter.sendMail({

      from: `"Collections App" <${process.env.EMAIL_FROM}>`,

      to: user.email,

      subject: "Reset your password",

      html: `
        <h2>Password Reset</h2>

        <p>You requested a password reset.</p>

        <p>
          <a href="${resetLink}">
            Reset Password
          </a>
        </p>

        <p>
          This link will expire in 1 hour.
        </p>

        <p>
          If you did not request this, simply ignore this email.
        </p>
      `
    });

    res.json({
      message: "Reset email sent"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error"
    });

  }
});


/* RESET PASSWORD */
app.post("/api/reset-password/:token", async (req, res) => {
  try {

    const { password } = req.body;

    const { token } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE
        reset_token = $1
        AND reset_token_expires > NOW()
      `,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: "Invalid or expired token"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    await pool.query(
      `
      UPDATE users
      SET
        password = $1,
        reset_token = NULL,
        reset_token_expires = NULL
      WHERE id = $2
      `,
      [
        hashedPassword,
        result.rows[0].id
      ]
    );

    res.json({
      message: "Password updated"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error"
    });

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
      return res.status(404).json({
        error: "User not found"
      });
    }

    const user = userResult.rows[0];

    // GENERATE TOKEN
    const resetToken = crypto.randomBytes(32).toString("hex");

    // EXPIRES IN 1 HOUR
    const expires = new Date(
      Date.now() + 1000 * 60 * 60
    );

    await pool.query(
      `
      UPDATE users
      SET
        reset_token = $1,
        reset_token_expires = $2
      WHERE id = $3
      `,
      [
        resetToken,
        expires,
        user.id
      ]
    );

     

    res.json({
      message: "Password reset link sent",
      token: resetToken
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error"
    });
  }
});

/* CONFIRM RESET PASSWORD */

app.post("/api/auth/password-reset/confirm", async (req, res) => {
  try {

    const {
      token,
      new_password,
      confirm_new_password
    } = req.body;

    if (new_password !== confirm_new_password) {
      return res.status(400).json({
        error: "Passwords do not match"
      });
    }

    const userResult = await pool.query(
      `
      SELECT *
      FROM users
      WHERE reset_token = $1
      `,
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        error: "Invalid token"
      });
    }

    const user = userResult.rows[0];

    // CHECK EXPIRATION
    if (
      !user.reset_token_expires ||
      new Date(user.reset_token_expires) < new Date()
    ) {
      return res.status(400).json({
        error: "Token expired"
      });
    }

    const hashedPassword = await bcrypt.hash(
      new_password,
      10
    );

    await pool.query(
      `
      UPDATE users
      SET
        password = $1,
        reset_token = NULL,
        reset_token_expires = NULL
      WHERE id = $2
      `,
      [
        hashedPassword,
        user.id
      ]
    );

    res.json({
      message: "Password reset successful"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error"
    });
  }
});

/* ---------------- ANALYTICS ---------------- */

/* COLLECTION ANALYTICS */
app.get("/api/analytics/collection/:id", auth, async (req, res) => {
  try {
    const collectionId = req.params.id;

    
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

     
    const collection = await pool.query(
      `
      SELECT
        c.id,
        c.name,
        c.user_id,
        u.username AS owner_name
      FROM collections c
      JOIN users u ON u.id = c.user_id
      WHERE c.id = $1
      `,
      [collectionId]
    );

    if (collection.rows.length === 0) {
      return res.status(404).json({ error: "Collection not found" });
    }

    res.json({
      collection: collection.rows[0],
      items_count: Number(stats.rows[0].items_count),
      total_value: Number(stats.rows[0].total_value)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* USER ANALYTICS */
/*app.get("/api/analytics/user", auth, async (req, res) => {
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
});*/

/* USER ANALYTICS */
app.get("/api/analytics/user", auth, async (req, res) => {
  try {

    const userId = req.user.id;

     
    const collections = await pool.query(
      `
      SELECT COUNT(*) 
      FROM collections
      WHERE user_id = $1
      `,
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

     
    const chartQuery = await pool.query(
      `
      SELECT
        created_at,
        total_value
      FROM analytics_history
      WHERE user_id = $1
      ORDER BY created_at ASC
      `,
      [userId]
    );

    const chart_data = chartQuery.rows.map(row => ({
      date: row.created_at,
      value: row.total_value
    }));

    res.json({
      collections_count: Number(collections.rows[0].count),
      items_count: Number(items.rows[0].count),
      total_value: Number(value.rows[0].total_value),
      chart_data
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

/* GET VIEWS HISTORY (LATEST UNIQUE COLLECTIONS FIRST) */
app.get("/api/views-history", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT DISTINCT ON (views_history.collection_id)

        views_history.*,

        items.name AS item_name,
        items.image AS item_image,

        collections.name AS collection_name,
        collections.image AS collection_image,
        collections.category AS category,

        views_history.viewed_at

      FROM views_history

      LEFT JOIN items
        ON items.id = views_history.item_id

      LEFT JOIN collections
        ON collections.id = views_history.collection_id

      WHERE views_history.user_id = $1

      ORDER BY views_history.collection_id, views_history.viewed_at DESC
      `,
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

    if (
      me.rows.length === 0 ||
      me.rows[0].role !== "ADMIN"
    ) {
      return res.status(403).json({
        error: "No access"
      });
    }

     
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({
        error: "You cannot ban yourself"
      });
    }

    const { type, until } = req.body;

     
    const userResult = await pool.query(
      `
      SELECT id, username, status
      FROM users
      WHERE id = $1
      `,
      [req.params.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: "User not found"
      });
    }

     
    const result = await pool.query(
      `
      UPDATE users
      SET status = 'banned'
      WHERE id = $1
      RETURNING id, username, status
      `,
      [req.params.id]
    );

    res.json({
      message: "User banned",
      type: type || "permanent",
      until: until || null,
      user: result.rows[0]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error"
    });
  }
});

/* UNBAN USER */

app.post("/api/admin/users/:id/unban", auth, async (req, res) => {
  try {
    const me = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [req.user.id]
    );

    if (me.rows[0].role !== "ADMIN") {
      return res.status(403).json({ error: "No access" });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET status = 'active'
      WHERE id = $1
      RETURNING id, status
      `,
      [req.params.id]
    );

    return res.json({
      message: "User unbanned",
      user: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ADMIN DELETE COLLECTION */

app.delete("/api/admin/collections/:id", auth, async (req, res) => {
  try {

    const me = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [req.user.id]
    );

    if (me.rows[0].role !== "ADMIN") {
      return res.status(403).json({
        error: "No access"
      });
    }

    await pool.query(
      "DELETE FROM collections WHERE id = $1",
      [req.params.id]
    );

    res.json({
      message: "Collection deleted by admin"
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server error"
    });
  }
});

/* ADMIN DELETE ITEM */

app.delete("/api/admin/items/:id", auth, async (req, res) => {
  try {

    const me = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [req.user.id]
    );

    if (me.rows[0].role !== "ADMIN") {
      return res.status(403).json({
        error: "No access"
      });
    }

    await pool.query(
      "DELETE FROM items WHERE id = $1",
      [req.params.id]
    );

    res.json({
      message: "Item deleted by admin"
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server error"
    });
  }
});

/* ADMIN GET ALL USERS */

app.get("/api/admin/users", auth, async (req, res) => {
  try {

    const me = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [req.user.id]
    );

    if (me.rows[0].role !== "ADMIN") {
      return res.status(403).json({
        error: "No access"
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        email,
        username,
        city,
        country,
        role,
        status,
        created_at
      FROM users
      ORDER BY created_at DESC
      `
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error"
    });
  }
});

/* ADMIN GET ALL COLLECTIONS */

app.get("/api/admin/collections", auth, async (req, res) => {
  try {

    const me = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [req.user.id]
    );

    if (me.rows[0].role !== "ADMIN") {
      return res.status(403).json({
        error: "No access"
      });
    }

    const result = await pool.query(
      `
      SELECT
        collections.*,

        users.username AS owner_name,

        COUNT(items.id) AS items_count,

        COALESCE(SUM(items.estimated_value), 0) AS total_value

      FROM collections

      JOIN users
      ON users.id = collections.user_id

      LEFT JOIN items
      ON items.collection_id = collections.id

      GROUP BY collections.id, users.username

      ORDER BY collections.created_at DESC
      `
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error"
    });
  }
});

/* ADMIN GET ALL ITEMS */

app.get("/api/admin/items", auth, async (req, res) => {
  try {

    const me = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [req.user.id]
    );

    if (me.rows[0].role !== "ADMIN") {
      return res.status(403).json({
        error: "No access"
      });
    }

    const result = await pool.query(
      `
      SELECT
        items.*,

        collections.name AS collection_name,

        collections.user_id,

        users.username AS owner_name

      FROM items

      JOIN collections
      ON collections.id = items.collection_id

      JOIN users
      ON users.id = collections.user_id

      ORDER BY items.created_at DESC
      `
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error"
    });
  }
});

/* ---------------- START SERVER ---------------- */

if (process.env.NODE_ENV !== 'test') {
  app.listen(process.env.PORT || 5000, () => {
    console.log("Server running");
  });
}

module.exports = app;
