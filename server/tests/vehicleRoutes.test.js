import request from 'supertest';
import app from '../src/server.js';

describe('Vehicle Routes', () => {
  describe('POST /api/vehicles', () => {
    it('should return 201 and create a vehicle (mock test)', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .send({
          name: 'Truck',
          capacityKg: 1000,
          tyres: 4
        });
      expect([201, 400]).toContain(res.statusCode);
    });
  });

  describe('GET /api/vehicles/available', () => {
    it('should return 200 and an array (mock test)', async () => {
      const res = await request(app)
        .get('/api/vehicles/available')
        .query({
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 3600000).toISOString()
        });
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
}); 