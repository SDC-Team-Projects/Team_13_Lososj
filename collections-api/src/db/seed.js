require("dotenv").config();
const pool = require("./index");
const bcrypt = require("bcrypt");

async function seedDatabase() {
  console.log("Started filling DB with test data");
  try {
    await pool.query('TRUNCATE users, collections, items, categories, item_categories, activity, notifications, views_history, favorite_collections, favorites, photos CASCADE');
    console.log("Old data successfully deleted");

    const hashedUserPassword = await bcrypt.hash('user1234', 10);
    const hashedAdminPassword = await bcrypt.hash('admin1234', 10);

    const categoriesSrc = ['Books', 'Movies', 'Music', 'Games', 'Art'];
    const categoryIds = [];
    for (const cat of categoriesSrc) {
      const catRes = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [cat]);
      categoryIds.push(catRes.rows[0].id);
    }

    const userRes = await pool.query(
      `INSERT INTO users (email, password, username, city, country, role, status, bio) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      ['rigaCollector@test.com', hashedUserPassword, 'LuckyCollector', 'Riga', 'Latvia', 'USER', 'active', 'Collecting since 2016.']
    );
    const userId = userRes.rows[0].id;

    const adminRes = await pool.query(
      `INSERT INTO users (email, password, username, city, country, role, status, bio) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      ['vilniusAdmin@test.com', hashedAdminPassword, 'GrandAdmin', 'Vilnius', 'Lithuania', 'ADMIN', 'active', 'Main moderator.']
    );
    const adminId = adminRes.rows[0].id;

    const collectionTypes = [
      { name: 'Steven King books first editions', desc: 'Books in hard cover, original', cat: 'Books', private: true },
      { name: '1980s action movies', desc: 'Exchanged this box of VHS tapes for my bike back in 1992', cat: 'Movies', private: true },
      { name: 'Golden age of jazz', desc: 'Original vinyl from 50s', cat: 'Music', private: false },
      { name: 'Classic console games', desc: 'Collection of games from my childhood', cat: 'Games', private: false },
      { name: 'City paintings', desc: 'Pictures of my native city painted by local artist', cat: 'Art', private: false },
      
    ];

    for (const col of collectionTypes) {
      const colRes = await pool.query(
        `INSERT INTO collections (user_id, name, description, category, is_public, image) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [userId, col.name, col.desc, col.cat, !col.private, 'https://images.unsplash.com/photo-1590595906931-81f04f0ccebb']
      );
      const colId = colRes.rows[0].id;

      for (let i = 1; i <= 12; i++) {
        const itemRes = await pool.query(
          `INSERT INTO items (collection_id, name, description, notes, condition, estimated_value, custom_fields, image) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
          [
            colId,
            `Item №${i} from "${col.name}" series`,
            `Unique collection item № ${i}, has some historial value.`,
            `Bought at auction. Condition was ranked by an expert.`,
            i % 2 === 0 ? 'Excellent' : 'Good',
            (i * 120.50).toFixed(2),
            JSONstringify({ serial_number: `SR-${1000 + i}`, rarity_index: i }),
            'https://images.unsplash.com/photo-1603132591874-1a28a994ef73'
          ]
        );
        const itemId = itemRes.rows[0].id;

        const randomCatId = categoryIds[Math.floor(Math.random() * categoryIds.length)];
        await pool.query('INSERT INTO item_categories (item_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [itemId, randomCatId]);

        await pool.query('INSERT INTO photos (item_id, url) VALUES ($1, $2)', [itemId, 'https://images.unsplash.com/photo-example.jpg']);
        
        if (i % 3 === 0) {
          await pool.query('INSERT INTO views_history (user_id, item_id, collection_id) VALUES ($1, $2, $3)', [userId, itemId, colId]);
          await pool.query('INSERT INTO views_history (user_id, item_id, collection_id) VALUES ($1, $2, $3)', [adminId, itemId, colId]);
        }
      }
    }

    await pool.query("INSERT INTO activity (user_id, action, item) VALUES ($1, 'register', 'User registered')", [userId]);
    await pool.query("INSERT INTO activity (user_id, action, item) VALUES ($1, 'create_collection', 'Создана коллекция Римские Денарии')", [userId]);
    await pool.query("INSERT INTO notifications (user_id, title, message, is_read) VALUES ($1, 'Welcome. Again.', 'Your account is created and ready', false)", [userId]);
    await pool.query("INSERT INTO notifications (user_id, title, message, is_read) VALUES ($1, 'Attention', 'System is running in demo mode', true)", [userId]);

    console.log("DB successfully filled");
  } catch (err) {
    console.error("An error occured while filling DB:", err);
  } finally {
    await pool.end();
  }
}

seedDatabase();
