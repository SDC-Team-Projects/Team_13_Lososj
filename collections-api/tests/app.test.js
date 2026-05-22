const request = require('supertest');
const app = require('../src/app');

describe('API Basic Tests', () => {
  it('should return 404 for unknown route', async () => {
    const response = await request(app).get('/unknown');
    expect(response.status).toBe(404);
  });
  
  // todo
});
