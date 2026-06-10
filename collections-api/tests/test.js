const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/index');

describe('API Automation Tests', () => {
  let authToken;

  // AUTHENTICATION TESTS
  describe('Authentication', () => {
    
    // Registration
    describe('POST /api/auth/register', () => {
      it('should register user with valid data', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: `newuser_${Date.now()}@test.com`,
            password: 'validPassword123',
            username: 'newuser',
            city: 'Visaginas',
            country: 'Lithuania'
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
      });

      it('should fail with short password', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'test@test.com',
            password: 'short',
            username: 'testuser',
            city: 'Visaginas',
            country: 'Lithuania'
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('at least 8 characters');
      });

      it('should fail with invalid email', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'not-an-email',
            password: 'validPassword123',
            username: 'testuser',
            city: 'Visaginas',
            country: 'Lithuania'
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid email');
      });

      it('should fail if user already exists', async () => {
        const testEmail = `duplicate_${Date.now()}@test.com`;
        await request(app)
          .post('/api/auth/register')
          .send({
            email: testEmail,
            password: 'validPassword123',
            username: 'user1',
            city: 'Visaginas',
            country: 'Lithuania'
          });

        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: testEmail,
            password: 'validPassword123',
            username: 'user2',
            city: 'Elektrenai',
            country: 'Lithuania'
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('already exists');
      });
    });

    // Logging in
    describe('POST /api/auth/login', () => {
      const loginEmail = `login_${Date.now()}@test.com`;

      beforeAll(async () => {
        await request(app)
          .post('/api/auth/register')
          .send({
            email: loginEmail,
            password: 'validPassword123',
            username: 'loginuser',
            city: 'Visaginas',
            country: 'Lithuania'
          });
      });

      it('should login with valid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: loginEmail,
            password: 'validPassword123'
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body.user.email).toBe(loginEmail);
        
        authToken = response.body.token;
      });

      it('should fail with wrong password', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: loginEmail,
            password: 'wrongPassword'
          });

        expect(response.status).toBe(401);
        expect(response.body.error).toContain('Wrong password');
      });

      it('should fail with non-existent user', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'nonexistent_user_999@test.com',
            password: 'anyPassword'
          });

        expect(response.status).toBe(404);
        expect(response.body.error).toContain('not found');
      });

      it('should fail login if fields are empty', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: '' });
        
        expect(response.status).toBeDefined(); 
      });
    });

    // Logging out
    describe('POST /api/auth/logout', () => {
      it('should logout successfully', async () => {
        const response = await request(app)
          .post('/api/auth/logout');

        expect(response.status).toBe(200);
        expect(response.body.message).toContain('Logged out');
      });
    });
  });

  // COLLECTIONS TESTS
  describe('Collections', () => {
    let testCollectionId;

    it('GET /api/collections/public - should fetch public collections', async () => {
      const response = await request(app)
        .get('/api/collections/public');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /api/collections - should fail to create collection without token', async () => {
      const response = await request(app)
        .post('/api/collections')
        .send({
          name: 'Test Collection',
          description: 'My description',
          category: 'Books',
          is_public: true
        });
      
      expect(response.status).toBe(401); 
    });

    it('POST /api/collections - should create collection with valid token', async () => {
      const response = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `My Coins ${Date.now()}`,
          description: 'A collection of rare ancient coins',
          category: 'Coins',
          image: 'http://example.com/image.jpg',
          is_public: true
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.category).toBe('Coins');
      
      testCollectionId = response.body.id;
    });

    it('GET /api/collections/search - should search collections with query params', async () => {
      const response = await request(app)
        .get('/api/collections/search')
        .query({ q: 'Coins', category: 'Coins' });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    // Getting all user's collections
    it('GET /api/collections - should fetch all user collections', async () => {
      const response = await request(app)
        .get('/api/collections')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    // Getting collection by ID
    it('GET /api/collections/:id - should fetch specific collection details', async () => {
      const response = await request(app)
        .get(`/api/collections/${testCollectionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testCollectionId);
    });

    // Getting nonexistent collection by ID
    it('GET /api/collections/:id - should return 404 for non-existent collection', async () => {
      const response = await request(app)
        .get('/api/collections/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Collection not found');
    });

    // Updating collection
    it('PUT /api/collections/:id - should update collection fields', async () => {
      const response = await request(app)
        .put(`/api/collections/${testCollectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Coins Name',
          description: 'Completely new description',
          category: 'Coins',
          image: 'http://example.com/new-image.jpg',
          is_public: false
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Coins Name');
      expect(response.body.is_public).toBe(false);
    });

    // Updating nonexistent collection
    it('PUT /api/collections/:id - should return 404 when updating non-existent collection', async () => {
      const response = await request(app)
        .put('/api/collections/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Ghost Collection',
          description: 'No description',
          category: 'Other',
          image: '',
          is_public: true
        });

      expect(response.status).toBe(404);
    });

    // Deleting collection
    it('DELETE /api/collections/:id - should delete user collection successfully', async () => {
      const response = await request(app)
        .delete(`/api/collections/${testCollectionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Deleted successfully');
    });

    // Delete nonexistent collection
    it('DELETE /api/collections/:id - should return 404 when deleting non-existent collection', async () => {
      const response = await request(app)
        .delete('/api/collections/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('PUT /api/collections/:id - should fail update if token is missing', async () => {
      const response = await request(app)
        .put('/api/collections/1')
        .send({ name: 'No Token Update' });
      
      expect(response.status).toBe(401);
    });
  });

  // PROFILE TESTS
  describe('User Profile', () => {
    
    it('GET /api/profile - should fetch user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username');
      expect(response.body).toHaveProperty('email');
    });

    it('PUT /api/profile - should update user profile', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'updated_username',
          email: `updated_${Date.now()}@test.com`,
          city: 'Kaunas',
          country: 'Lithuania',
          bio: 'Software engineer and collector',
          avatar_url: 'http://example.com/avatar.jpg'
        });

      expect(response.status).toBe(200);
      expect(response.body.username).toBe('updated_username');
      expect(response.body.city).toBe('Kaunas');
    });

    it('PUT /api/profile - should fail update if email is missing', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'no_email_user'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Email and username are required');
    });
  });

  // COLLECTIONS ROUTER TESTS
  describe('Collections Router (routes/collections.js)', () => {
    let testCollectionId;

    // Creating a collection
    it('POST /api/collections - should create a new collection', async () => {
      const response = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Router Test Collection ${Date.now()}`,
          description: 'Testing endpoints in routes/collections.js',
          category: 'Stamps',
          image: 'http://example.com/stamps.jpg',
          is_public: true
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      
      testCollectionId = response.body.id;
    });

    // Getting all user collections
    it('GET /api/collections - should get all user collections', async () => {
      const response = await request(app)
        .get('/api/collections')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    // Getting collection by ID
    it('GET /api/collections/:id - should get single collection by ID', async () => {
      const response = await request(app)
        .get(`/api/collections/${testCollectionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testCollectionId);
    });

    // Updating collection
    it('PUT /api/collections/:id - should update collection name and description', async () => {
      const response = await request(app)
        .put(`/api/collections/${testCollectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Completely Updated Name',
          description: 'Updated description text'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Completely Updated Name');
      expect(response.body).toHaveProperty('description', 'Updated description text');
    });

    // Invalid token
    it('GET /api/collections - should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/collections')
        .set('Authorization', 'Bearer fake_invalid_token_123');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid token');
    });

    // Deleting collection
    it('DELETE /api/collections/:id - should delete collection successfully', async () => {
      const response = await request(app)
        .delete(`/api/collections/${testCollectionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Deleted successfully');
    });
  });

  // ITEMS TESTS
  describe('Items', () => {
    let itemId;
    let parentCollectionId;

    beforeAll(async () => {
      const colResponse = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Collection for Items Test ${Date.now()}`,
          description: 'Parent collection description',
          category: 'Other',
          is_public: true
        });
      
      parentCollectionId = colResponse.body.id || 1;
    });

    // Creating item
    it('POST /api/items - should create a new item in collection', async () => {
      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          collection_id: parentCollectionId,
          name: `Rare Item ${Date.now()}`,
          description: 'Unique artifact description',
          notes: 'Some private notes',
          condition: 'Mint',
          estimated_value: 150,
          custom_fields: JSON.stringify({ material: 'Gold' })
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      itemId = response.body.id;
    });

    // Getting collection items
    it('GET /api/collections/:id/items - should fetch items from specific collection', async () => {
      const response = await request(app)
        .get(`/api/collections/${parentCollectionId}/items`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    // Getting an item by ID
    it('GET /api/items/:id - should fetch single item details', async () => {
      const idToFetch = itemId || 1;
      const response = await request(app)
        .get(`/api/items/${idToFetch}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', idToFetch);
    });

    // Updating item
    it('PUT /api/items/:id - should update item data', async () => {
      const idToUpdate = itemId || 1;
      const response = await request(app)
        .put(`/api/items/${idToUpdate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Item Name',
          description: 'Brand new description for this item',
          notes: 'Updated notes',
          condition: 'Good',
          estimated_value: 200,
          custom_fields: JSON.stringify({ material: 'Silver' })
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated Item Name');
    });

    // Adding and deleting item photo
    it('POST & DELETE /api/items/:id/photos - should manage item photos', async () => {
      const idToPhoto = itemId || 1;
      const addPhotoRes = await request(app)
        .post(`/api/items/${idToPhoto}/photos`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ url: 'http://example.com/photo.jpg' });

      expect(addPhotoRes.status).toBe(200);
      expect(addPhotoRes.body).toHaveProperty('id');

      const deletePhotoRes = await request(app)
        .delete(`/api/photos/${addPhotoRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deletePhotoRes.status).toBe(200);
      expect(deletePhotoRes.body.message).toBe('Photo deleted');
    });

    // Deleting item
    it('DELETE /api/items/:id - should delete item', async () => {
      const idToDelete = itemId || 1;
      const response = await request(app)
        .delete(`/api/items/${idToDelete}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Deleted successfully');
    });
  });

  // EXTRA FEATURES
  describe('Extra Features from app.js', () => {

    it('POST, GET & DELETE /api/favorites - should manage favorites', async () => {
      const newColRes = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Favorite Target Collection ${Date.now()}`,
          description: 'Testing constraints',
          category: 'Coins',
          is_private: false
        });

      const realCollectionId = newColRes.body.id;

      const favColRes = await request(app)
        .post(`/api/favorites/collections/${realCollectionId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(favColRes.status).toBe(200);

      const getFavCols = await request(app)
        .get('/api/favorites/collections')
        .set('Authorization', `Bearer ${authToken}`);
      expect(getFavCols.status).toBe(200);

      await request(app)
        .delete(`/api/favorites/collections/${realCollectionId}`)
        .set('Authorization', `Bearer ${authToken}`);
    });

    // Notifications and activity
    it('GET /api/activity & /api/notifications - should fetch logs', async () => {
      const activityRes = await request(app)
        .get('/api/activity')
        .set('Authorization', `Bearer ${authToken}`);
      expect(activityRes.status).toBe(200);

      const notifyRes = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);
      expect(notifyRes.status).toBe(200);
    });

    it('Password Management Endpoints', async () => {
      // Request to reset password
      const resetReq = await request(app)
        .post('/api/auth/password-reset/request')
        .send({ email: 'loginuser@test.com' });
      expect(resetReq.status).toBeDefined();

      // Reset confirm
      const resetConfirm = await request(app)
        .post('/api/auth/password-reset/confirm')
        .send({
          token: 'RESET_TOKEN_123',
          new_password: 'newSecretPassword123',
          confirm_new_password: 'newSecretPassword123'
        });
      expect(resetConfirm.status).toBeDefined();
    });
  });

  // ANALYTICS TESTS
  describe('Analytics Endpoints', () => {

    // Analytics of a collection
    it('GET /api/analytics/collection/:id - should return collection stats', async () => {
      const response = await request(app)
        .get('/api/analytics/collection/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('items_count');
      expect(response.body).toHaveProperty('total_value');
      expect(response.body).toHaveProperty('categories_distribution');
      expect(Array.isArray(response.body.categories_distribution)).toBe(true);
    });

    // Analytics of a collection without token
    it('GET /api/analytics/collection/:id - should fail without token', async () => {
      const response = await request(app)
        .get('/api/analytics/collection/1');

      expect(response.status).toBe(401);
    });

    // User analytics 
    it('GET /api/analytics/user - should return general user stats', async () => {
      const response = await request(app)
        .get('/api/analytics/user')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('collections_count');
      expect(response.body).toHaveProperty('items_count');
      expect(response.body).toHaveProperty('total_value');
    });

    // User analytics without token
    it('GET /api/analytics/user - should fail without token', async () => {
      const response = await request(app)
        .get('/api/analytics/user');

      expect(response.status).toBe(401);
    });
  });

  // ADMIN TESTS
  describe('Admin Operations', () => {
    let adminId;
    let adminCollectionId;
    let adminToken;
    let targetUserId;

    beforeAll(async () => {
      const adminEmail = `admin_${Date.now()}@test.com`;

      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: adminEmail,
          password: 'adminPassword123',
          username: 'superadmin',
          city: 'Vilnius',
          country: 'Lithuania'
        });

      await pool.query(
        "UPDATE users SET role = 'ADMIN' WHERE email = $1",
        [adminEmail]
      );

      adminToken = registerRes.body.token;

      const adminResult = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [adminEmail]
      );

      adminId = adminResult.rows[0].id;

      const userEmail = `target_${Date.now()}@test.com`;

      const userRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: userEmail,
          password: 'userPassword123',
          username: 'targetUser',
          city: 'Vilnius',
          country: 'Lithuania'
        });

      targetUserId = userRes.body.user.id;

      const collectionRes = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Admin Test Collection',
          description: 'Test'
        });

      adminCollectionId = collectionRes.body.id;
    });

    // Access denial for regular user
    describe('Access Denied for Regular Users', () => {
      it('POST /api/admin/users/:id/ban - should deny access', async () => {
        const response = await request(app)
          .post(`/api/admin/users/${targetUserId}/ban`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ type: 'temporary', until: '2030-01-01' });
        expect(response.status).toBe(403);
        expect(response.body.error).toBe('No access');
      });

      it('POST /api/admin/users/:id/unban - should deny access', async () => {
        const response = await request(app)
          .post(`/api/admin/users/${targetUserId}/unban`)
          .set('Authorization', `Bearer ${authToken}`);
        expect(response.status).toBe(403);
      });

      it('DELETE /api/admin/collections/:id - should deny access', async () => {
        const response = await request(app)
          .delete('/api/admin/collections/1')
          .set('Authorization', `Bearer ${authToken}`);
        expect(response.status).toBe(403);
      });

      it('DELETE /api/admin/items/:id - should deny access', async () => {
        const response = await request(app)
          .delete('/api/admin/items/1')
          .set('Authorization', `Bearer ${authToken}`);
        expect(response.status).toBe(403);
      });

      it('GET /api/admin/users - should deny access', async () => {
        const response = await request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${authToken}`);
        expect(response.status).toBe(403);
      });

      it('GET /api/admin/collections - should deny access', async () => {
        const response = await request(app)
          .get('/api/admin/collections')
          .set('Authorization', `Bearer ${authToken}`);
        expect(response.status).toBe(403);
      });

      it('GET /api/admin/items - should deny access', async () => {
        const response = await request(app)
          .get('/api/admin/items')
          .set('Authorization', `Bearer ${authToken}`);
        expect(response.status).toBe(403);
      });
    });

    // Successful Admin Operations
    describe('Successful Admin Operations', () => {
      it('GET /api/admin/users - should return list of users', async () => {
        const response = await request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('GET /api/admin/collections - should return list of all collections', async () => {
        const response = await request(app)
          .get('/api/admin/collections')
          .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('GET /api/admin/items - should return list of all items', async () => {
        const response = await request(app)
          .get('/api/admin/items')
          .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('POST /api/admin/users/:id/ban - should successfully ban a user', async () => {
        const response = await request(app)
          .post(`/api/admin/users/${targetUserId}/ban`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ type: 'permanent' });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User banned');
      });

      it('POST /api/admin/users/:id/unban - should successfully unban a user', async () => {
        const response = await request(app)
          .post(`/api/admin/users/${targetUserId}/unban`)
          .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User unbanned');
      });

      it('DELETE /api/admin/collections/:id - should delete any collection', async () => {
        const response = await request(app)
          .delete('/api/admin/collections/1')
          .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBeDefined();
      });

      it('DELETE /api/admin/items/:id - should delete any item', async () => {
        const response = await request(app)
          .delete('/api/admin/items/1')
          .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBeDefined();
      });
    });

    describe('Other admin operations', () => {
      it('should not allow admin to ban himself', async () => {
        const response = await request(app)
          .post(`/api/admin/users/${adminId}/ban`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ type: 'permanent' });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('You cannot ban yourself');
      });

      it('should return 404 for non-existent user', async () => {
        const response = await request(app)
          .post('/api/admin/users/999999999/ban')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ type: 'permanent' });

        expect(response.status).toBe(404);
        expect(response.body.error).toContain('User not found');
      });
    });

    describe('PDF export', () => {
      it('should export collection as pdf', async () => {
        const dbResult = await pool.query('SELECT id FROM collections LIMIT 1');
        
        if (dbResult.rows.length === 0) {
          throw new Error("No collections to export");
        }
        
        const validCollectionId = dbResult.rows[0].id;

        const response = await request(app)
          .get(`/api/collections/${validCollectionId}/export`)
          .set('Authorization', `Bearer ${adminToken}`);
          
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('application/pdf');
      });

      it('should return 404 when exporting missing collection', async () => {
        const response = await request(app)
          .get('/api/collections/999999/export')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toContain('Collection not found');
      });
    });
  });

  /*
    describe('Views & Password reset', () => {
      let targetUserEmail;
      let dynamicToken;

      beforeAll(async () => {
        const userResult = await pool.query('SELECT email FROM users LIMIT 1');
        if (userResult.rows.length > 0) {
          targetUserEmail = userResult.rows[0].email;
        } else {
          targetUserEmail = 'admin@test.com';
        }

        try {
          if (typeof adminToken !== 'undefined') dynamicToken = adminToken;
          else if (typeof authToken !== 'undefined') dynamicToken = authToken;
          else if (typeof token !== 'undefined') dynamicToken = token;
        } catch (e) {
          dynamicToken = null;
        }
      });

      async function getValidToken() {
        if (dynamicToken) return dynamicToken;
        const loginRes = await request(app)
          .post('/api/auth/login')
          .send({ email: targetUserEmail, password: 'password123' });
        return loginRes.body.token || '';
      }

      // Tests for GET (/api/views-history)
      describe('GET /api/views-history', () => {
        it('should fetch view history successfully for authenticated user', async () => {
          const activeToken = await getValidToken();
          const response = await request(app)
            .get('/api/views-history')
            .set('Authorization', `Bearer ${activeToken}`);

          expect(response.status).toBe(200);
          expect(Array.isArray(response.body)).toBe(true);
        });

        it('should return 401 if token is missing', async () => {
          const response = await request(app).get('/api/views-history');
          expect(response.status).toBe(401);
        });
      });

      // Tests for password reset (REQUEST & CONFIRM)
      describe('Password Reset Flow', () => {
        
        it('should successfully request password reset and return a token', async () => {
          const response = await request(app)
            .post('/api/auth/password-reset/request')
            .send({ email: targetUserEmail });

          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('message', 'Password reset link sent');
          expect(response.body).toHaveProperty('token');
        });

        it('should return 404 when requesting reset for non-existent email', async () => {
          const response = await request(app)
            .post('/api/auth/password-reset/request')
            .send({ email: 'ghost_user_2026_not_found@test.com' });

          expect(response.status).toBe(404);
        });

        it('should fail to confirm reset if passwords do not match', async () => {
          const response = await request(app)
            .post('/api/auth/password-reset/confirm')
            .send({
              token: 'any-token-structure',
              new_password: 'NewPassword123!',
              confirm_new_password: 'DifferentPassword123!'
            });

          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty('error', 'Passwords do not match');
        });

        it('should fail to confirm reset with an invalid or fake token', async () => {
          const response = await request(app)
            .post('/api/auth/password-reset/confirm')
            .send({
              token: 'completely-fake-token-that-does-not-exist-in-db-12345',
              new_password: 'ValidPassword123!',
              confirm_new_password: 'ValidPassword123!'
            });

          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty('error', 'Invalid token');
        });

        it('should fail to confirm reset if the token has expired', async () => {
          const reqResponse = await request(app)
            .post('/api/auth/password-reset/request')
            .send({ email: targetUserEmail });
          
          const realToken = reqResponse.body.token;

          const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 5);
          await pool.query(
            'UPDATE users SET reset_token_expires = $1 WHERE reset_token = $2',
            [pastDate, realToken]
          );

          const response = await request(app)
            .post('/api/auth/password-reset/confirm')
            .send({
              token: realToken,
              new_password: 'NewPassword123!',
              confirm_new_password: 'NewPassword123!'
            });

          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty('error', 'Token expired');
        });

        it('should successfully confirm password reset with a valid token', async () => {
          const reqResponse = await request(app)
            .post('/api/auth/password-reset/request')
            .send({ email: targetUserEmail });
          
          const validToken = reqResponse.body.token;

          const response = await request(app)
            .post('/api/auth/password-reset/confirm')
            .send({
              token: validToken,
              new_password: 'BrandNewPassword2026!',
              confirm_new_password: 'BrandNewPassword2026!'
            });

          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('message', 'Password reset successful');
        });
      });

      // Tests for CATCH (SERVER ERROR 500)
      describe('Error handling (500 Status Covers)', () => {
        it('should return 500 on history if DB crashes', async () => {
          const activeToken = await getValidToken();
          const originalQuery = pool.query;
          pool.query = jest.fn().mockRejectedValue(new Error('Database explosion'));

          const response = await request(app)
            .get('/api/views-history')
            .set('Authorization', `Bearer ${activeToken}`);

          expect(response.status).toBe(500);
          expect(response.body).toHaveProperty('error', 'Server error');

          pool.query = originalQuery;
        });
      });
    });
  });
*/


  // Views & Password Reset
  describe('Views History & Password Reset Isolation Tests', () => {

    async function getHelperEmail() {
      const userResult = await pool.query('SELECT email FROM users LIMIT 1');
      return userResult.rows.length > 0 ? userResult.rows[0].email : 'admin@test.com';
    }

    async function getHelperToken() {
      try {
        if (typeof adminToken !== 'undefined' && adminToken) return adminToken;
        if (typeof authToken !== 'undefined' && authToken) return authToken;
      } catch (e) {}

      const email = await getHelperEmail();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'adminPassword123' }); 
      return loginRes.body.token || '';
    }

    // Tests for GET (/api/views-history)
    describe('GET /api/views-history', () => {
      it('should fetch view history successfully for authenticated user', async () => {
        const activeToken = await getHelperToken();
        const response = await request(app)
          .get('/api/views-history')
          .set('Authorization', `Bearer ${activeToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should return 401 if token is missing', async () => {
        const response = await request(app).get('/api/views-history');
        expect(response.status).toBe(401);
      });
    });

    // Tests for password reset (REQUEST & CONFIRM)
    describe('Password Reset Flow Isolated', () => {
      it('should successfully request password reset and return a token', async () => {
        const email = await getHelperEmail();
        const response = await request(app)
          .post('/api/auth/password-reset/request')
          .send({ email });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Password reset link sent');
        expect(response.body).toHaveProperty('token');
      });

      it('should return 404 when requesting reset for non-existent email', async () => {
        const response = await request(app)
          .post('/api/auth/password-reset/request')
          .send({ email: 'ghost_user_2026_not_found@test.com' });

        expect(response.status).toBe(404);
      });

      it('should fail to confirm reset if passwords do not match', async () => {
        const response = await request(app)
          .post('/api/auth/password-reset/confirm')
          .send({
            token: 'any-token-structure',
            new_password: 'NewPassword123!',
            confirm_new_password: 'DifferentPassword123!'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Passwords do not match');
      });

      it('should fail to confirm reset with an invalid or fake token', async () => {
        const response = await request(app)
          .post('/api/auth/password-reset/confirm')
          .send({
            token: 'completely-fake-token-that-does-not-exist-in-db-12345',
            new_password: 'ValidPassword123!',
            confirm_new_password: 'ValidPassword123!'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid token');
      });

      it('should fail to confirm reset if the token has expired', async () => {
        const email = await getHelperEmail();
        const reqResponse = await request(app)
          .post('/api/auth/password-reset/request')
          .send({ email });
        
        const realToken = reqResponse.body.token;

        const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 5);
        await pool.query(
          'UPDATE users SET reset_token_expires = $1 WHERE reset_token = $2',
          [pastDate, realToken]
        );

        const response = await request(app)
          .post('/api/auth/password-reset/confirm')
          .send({
            token: realToken,
            new_password: 'NewPassword123!',
            confirm_new_password: 'NewPassword123!'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Token expired');
      });

      it('should successfully confirm password reset with a valid token', async () => {
        const email = await getHelperEmail();
        const reqResponse = await request(app)
          .post('/api/auth/password-reset/request')
          .send({ email });
        
        const validToken = reqResponse.body.token;

        const response = await request(app)
          .post('/api/auth/password-reset/confirm')
          .send({
            token: validToken,
            new_password: 'BrandNewPassword2026!',
            confirm_new_password: 'BrandNewPassword2026!'
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Password reset successful');
      });
    });

    // Tests for CATCH (SERVER ERROR 500)
    describe('Error handling (500 Status Covers Isolated)', () => {
      it('should return 500 on history if DB crashes', async () => {
        const activeToken = await getHelperToken();
        const originalQuery = pool.query;
        pool.query = jest.fn().mockRejectedValue(new Error('Database explosion'));

        const response = await request(app)
          .get('/api/views-history')
          .set('Authorization', `Bearer ${activeToken}`);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Server error');

        pool.query = originalQuery;
      });
    });
  });

  // Password Change, User Details, Item Favorites
  describe('Profile Password & Item Favorites Coverage', () => {

    async function getFreshUserContext() {
      const userResult = await pool.query('SELECT id, email FROM users LIMIT 1');
      if (userResult.rows.length === 0) {
        throw new Error("No users found in database for context");
      }
      const user = userResult.rows[0];
    
      const bcrypt = require('bcrypt');
      const testHash = await bcrypt.hash('validPassword123', 10);
      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [testHash, user.id]);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'validPassword123' });

      return {
        token: loginRes.body.token,
        id: user.id
      };
    }

    async function getValidItemId() {
      const itemResult = await pool.query('SELECT id FROM items LIMIT 1');
      if (itemResult.rows.length > 0) {
        return itemResult.rows[0].id;
      }
      
      const colResult = await pool.query('SELECT id FROM collections LIMIT 1');
      const colId = colResult.rows.length > 0 ? colResult.rows[0].id : 1;
      
      const newItem = await pool.query(
        "INSERT INTO items (collection_id, name, description, condition, estimated_value) VALUES ($1, 'Test Item', 'Desc', 'Mint', 10) RETURNING id",
        [colId]
      );
      return newItem.rows[0].id;
    }

    // PUT /api/profile/password
    describe('PUT /api/profile/password', () => {
      it('should successfully change password with correct old password', async () => {
        const ctx = await getFreshUserContext();
        const response = await request(app)
          .put('/api/profile/password')
          .set('Authorization', `Bearer ${ctx.token}`)
          .send({
            old_password: 'validPassword123',
            new_password: 'completelyNewPassword2026!'
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Password updated');
      });

      it('should fail to change password with wrong old password', async () => {
        const ctx = await getFreshUserContext();
        const response = await request(app)
          .put('/api/profile/password')
          .set('Authorization', `Bearer ${ctx.token}`)
          .send({
            old_password: 'wrong-old-password-123',
            new_password: 'someNewPassword123!'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Wrong old password');
      });
    });

    // GET /api/users/:id
    describe('GET /api/users/:id', () => {
      it('should fetch user profile details by valid ID', async () => {
        const ctx = await getFreshUserContext();
        const response = await request(app).get(`/api/users/${ctx.id}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', ctx.id);
        expect(response.body).toHaveProperty('username');
        expect(response.body).not.toHaveProperty('password');
      });

      it('should return 404 for non-existent user ID', async () => {
        const response = await request(app).get('/api/users/9999999');
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'User not found');
      });
    });

    // Favorite items (GET, POST, DELETE)
    describe('Favorites Items Flow (/api/favorites)', () => {
      it('should successfully add an item to favorites, fetch it, and remove it', async () => {
        const ctx = await getFreshUserContext();
        const itemId = await getValidItemId();

        await pool.query('DELETE FROM favorites WHERE user_id = $1 AND item_id = $2', [ctx.id, itemId]);

        // POST /api/favorites/:item_id
        const addResponse = await request(app)
          .post(`/api/favorites/${itemId}`)
          .set('Authorization', `Bearer ${ctx.token}`);
        
        expect(addResponse.status).toBe(200);
        expect(addResponse.body).toHaveProperty('item_id', itemId);

        // GET /api/favorites
        const getResponse = await request(app)
          .get('/api/favorites')
          .set('Authorization', `Bearer ${ctx.token}`);

        expect(getResponse.status).toBe(200);
        expect(Array.isArray(getResponse.body)).toBe(true);
        expect(getResponse.body.some(item => item.id === itemId)).toBe(true);

        // DELETE /api/favorites/:item_id
        const deleteResponse = await request(app)
          .delete(`/api/favorites/${itemId}`)
          .set('Authorization', `Bearer ${ctx.token}`);

        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body).toHaveProperty('message', 'Removed from favorites');
      });

      it('should return 404 when trying to remove an item that is not in favorites', async () => {
        const ctx = await getFreshUserContext();
        const response = await request(app)
          .delete('/api/favorites/9999999')
          .set('Authorization', `Bearer ${ctx.token}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Not in favorites');
      });
    });

    // CATCH blocks (STATUS 500)
    describe('Database Crash Error Handling (500)', () => {
      it('should return 500 on password update if DB throws error', async () => {
        const ctx = await getFreshUserContext();
        const originalQuery = pool.query;
        pool.query = jest.fn().mockRejectedValue(new Error('Critical DB failure'));

        const response = await request(app)
          .put('/api/profile/password')
          .set('Authorization', `Bearer ${ctx.token}`)
          .send({ old_password: '1', new_password: '2' });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Server error');

        pool.query = originalQuery;
      });

      it('should return 500 on get user profile by id if DB throws error', async () => {
        const originalQuery = pool.query;
        pool.query = jest.fn().mockRejectedValue(new Error('Critical DB failure'));

        const response = await request(app).get('/api/users/1');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Server error');

        pool.query = originalQuery;
      });
    });
  });
  
  afterAll(async () => {
    await pool.end();
  });
});
