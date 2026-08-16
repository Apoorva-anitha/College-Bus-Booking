import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

describe('Authentication & JWT RBAC API', () => {
  it('should authenticate default student and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'student_1',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('STUDENT');
  });

  it('should reject invalid credentials with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'non_existent_user',
        password: 'wrong_password'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow dynamic role switching for testing', async () => {
    const res = await request(app)
      .post('/api/auth/switch-role')
      .send({
        role: 'ADMIN'
      });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('ADMIN');
    expect(res.body.token).toBeDefined();
  });
});
