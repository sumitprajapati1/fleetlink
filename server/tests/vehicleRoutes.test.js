import request from 'supertest';
import app from '../src/server.js';

describe('Vehicle Routes', () => {
  describe('POST /api/vehicles', () => {
    it('should return 201 and create a vehicle with valid data', async () => {
      const vehicleData = {
        name: 'Test Truck',
        capacityKg: 1000,
        tyres: 4
      };

      const res = await request(app)
        .post('/api/vehicles')
        .send(vehicleData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Vehicle created successfully');
      expect(res.body.data).toMatchObject({
        name: vehicleData.name,
        capacityKg: vehicleData.capacityKg,
        tyres: vehicleData.tyres
      });
    });

    it('should return 400 for invalid vehicle data', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .send({
          // Missing required fields
          name: '',
          capacityKg: 0,
          tyres: 0
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if vehicle already exists', async () => {
      const vehicleData = {
        name: 'Duplicate Truck',
        capacityKg: 1500,
        tyres: 6
      };

      // First request should succeed
      await request(app)
        .post('/api/vehicles')
        .send(vehicleData);

      // Second request with same name should fail
      const res = await request(app)
        .post('/api/vehicles')
        .send(vehicleData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/vehicles/available', () => {
    it('should return 200 and available vehicles with valid query parameters', async () => {
      const futureTime = new Date(Date.now() + 3600000); // 1 hour from now
      
      const res = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: 500,
          fromPincode: '123456',
          toPincode: '654321',
          startTime: futureTime.toISOString()
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(typeof res.body.estimatedRideDurationHours).toBe('number');
    });

    it('should return 400 for missing required parameters', async () => {
      const res = await request(app)
        .get('/api/vehicles/available')
        .query({
          // Missing required parameters
          capacityRequired: 500
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid pincode format', async () => {
      const futureTime = new Date(Date.now() + 3600000);
      
      const res = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: 500,
          fromPincode: '12345', // Invalid - only 5 digits
          toPincode: '654321',
          startTime: futureTime.toISOString()
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for past start time', async () => {
      const pastTime = new Date(Date.now() - 3600000); // 1 hour ago
      
      const res = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: 500,
          fromPincode: '123456',
          toPincode: '654321',
          startTime: pastTime.toISOString()
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/vehicles', () => {
    it('should return 200 and paginated vehicles list', async () => {
      const res = await request(app)
        .get('/api/vehicles')
        .query({
          page: 1,
          limit: 10
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(0);
    });

    it('should filter by isActive parameter', async () => {
      const res = await request(app)
        .get('/api/vehicles')
        .query({
          isActive: 'true'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

describe('Booking Routes', () => {
  describe('POST /api/bookings', () => {
    it('should return 400 for incomplete booking data', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({}); // Send empty data
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid vehicle ID format', async () => {
      const futureTime = new Date(Date.now() + 3600000);
      
      const res = await request(app)
        .post('/api/bookings')
        .send({
          vehicleId: 'invalid-id',
          customerId: 'customer123',
          fromPincode: '123456',
          toPincode: '654321',
          startTime: futureTime.toISOString()
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid pincode format', async () => {
      const futureTime = new Date(Date.now() + 3600000);
      
      const res = await request(app)
        .post('/api/bookings')
        .send({
          vehicleId: '507f1f77bcf86cd799439011', // Valid ObjectId format
          customerId: 'customer123',
          fromPincode: '12345', // Invalid - only 5 digits
          toPincode: '654321',
          startTime: futureTime.toISOString()
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for past start time', async () => {
      const pastTime = new Date(Date.now() - 3600000);
      
      const res = await request(app)
        .post('/api/bookings')
        .send({
          vehicleId: '507f1f77bcf86cd799439011',
          customerId: 'customer123',
          fromPincode: '123456',
          toPincode: '654321',
          startTime: pastTime.toISOString()
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent vehicle', async () => {
      const futureTime = new Date(Date.now() + 3600000);
      
      const res = await request(app)
        .post('/api/bookings')
        .send({
          vehicleId: '507f1f77bcf86cd799439011', // Valid format but non-existent
          customerId: 'customer123',
          fromPincode: '123456',
          toPincode: '654321',
          startTime: futureTime.toISOString()
        });
      
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/bookings', () => {
    it('should return 200 and paginated bookings list', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .query({
          page: 1,
          limit: 10
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it('should filter bookings by customerId', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .query({
          customerId: 'customer123'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should return 400 for invalid booking ID format', async () => {
      const res = await request(app)
        .get('/api/bookings/invalid-id');
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent booking', async () => {
      const res = await request(app)
        .get('/api/bookings/507f1f77bcf86cd799439011'); // Valid format but non-existent
      
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('should return 400 for invalid booking ID format', async () => {
      const res = await request(app)
        .delete('/api/bookings/invalid-id');
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent booking', async () => {
      const res = await request(app)
        .delete('/api/bookings/507f1f77bcf86cd799439011'); // Valid format but non-existent
      
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
}); 