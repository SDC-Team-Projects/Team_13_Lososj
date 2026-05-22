const request = require('supertest');
const app = require('../src/app');

describe('Authentication', () => {
  
  // Registration
  describe('POST /api/auth/register', () => {
    
    it('should register user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser123@test.com',
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
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'validPassword123',
          username: 'user1',
          city: 'Visaginas',
          country: 'Lithuania'
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@test.com',
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
    
    it('should login with valid credentials', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'login@test.com',
          password: 'validPassword123',
          username: 'loginuser',
          city: 'Visaginas',
          country: 'Lithuania'
        });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'validPassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('login@test.com');
    });

    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'wrongPassword'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Wrong password');
    });

    it('should fail with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
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

  afterAll(async () => {
    // await db.close();
    await new Promise(resolve => setTimeout(resolve, 100));
  });
});
