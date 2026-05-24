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

  afterAll(async () => {
    await pool.end();
  });
});
