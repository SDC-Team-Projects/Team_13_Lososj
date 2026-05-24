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

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Wrong password');
      });

      it('should fail with non-existent user', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'nonexistent_user_999@test.com',
            password: 'anyPassword'
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('not found');
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
    });

    it('GET /api/collections/search - should search collections with query params', async () => {
      const response = await request(app)
        .get('/api/collections/search')
        .query({ q: 'Coins', category: 'Coins' });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
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
      // Adding collection to favorites
      const favColRes = await request(app)
        .post('/api/favorites/collections/1')
        .set('Authorization', `Bearer ${authToken}`);
      expect(favColRes.status).toBe(200);

      // Get favorite collections
      const getFavCols = await request(app)
        .get('/api/favorites/collections')
        .set('Authorization', `Bearer ${authToken}`);
      expect(getFavCols.status).toBe(200);

      // Delete from favorites
      await request(app).delete('/api/favorites/1').set('Authorization', `Bearer ${authToken}`);
      await request(app).delete('/api/favorites/collections/1').set('Authorization', `Bearer ${authToken}`);
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

  afterAll(async () => {
    await pool.end();
  });
});
