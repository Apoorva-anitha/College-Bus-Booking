import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { dbStore } from '../../db';

const app = createApp();

describe('Authoritative Student Authentication & Hosteller Eligibility Test Suite', () => {
  const testDate = '2026-09-15';
  const testSlot = 'slot-3pm';
  const testStop = 'stop-adyar-signal';

  beforeEach(() => {
    dbStore.seedInitialState();
  });

  it('1. should authenticate valid student (23CSE1045) and return JWT with safe profile', async () => {
    const res = await request(app)
      .post('/api/auth/student/login')
      .send({
        registrationNumber: '23CSE1045',
        password: 'password'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.registrationNumber).toBe('23CSE1045');
    expect(res.body.user.isHosteller).toBe(false);
    expect(res.body.user.role).toBe('STUDENT');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('2. should reject non-existent registration number with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/student/login')
      .send({
        registrationNumber: '23CSE9999_NON_EXISTENT',
        password: 'password'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid registration number or password');
  });

  it('3. should reject invalid password with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/student/login')
      .send({
        registrationNumber: '23CSE1045',
        password: 'wrong_password_xyz'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('4. should reject inactive student account with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/student/login')
      .send({
        registrationNumber: '23ME1099',
        password: 'password'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('inactive');
  });

  it('5. should BLOCK hosteller (23CSE1046) from booking with 403 Forbidden', async () => {
    // Login as hosteller student
    const loginRes = await request(app)
      .post('/api/auth/student/login')
      .send({
        registrationNumber: '23CSE1046',
        password: 'password'
      });

    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;
    expect(loginRes.body.user.isHosteller).toBe(true);

    // Attempt booking
    const bookingRes = await request(app)
      .post('/api/student/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: testDate,
        departureSlotId: testSlot,
        busStopId: testStop
      });

    expect(bookingRes.status).toBe(403);
    expect(bookingRes.body.success).toBe(false);
    expect(bookingRes.body.code).toBe('HOSTELLER_NOT_ELIGIBLE');
    expect(bookingRes.body.error || bookingRes.body.message).toContain('Hostel students are not eligible');
  });

  it('6. should ALLOW day scholar (23CSE1045) to successfully book a seat', async () => {
    const loginRes = await request(app)
      .post('/api/auth/student/login')
      .send({
        registrationNumber: '23CSE1045',
        password: 'password'
      });

    const token = loginRes.body.token;

    const bookingRes = await request(app)
      .post('/api/student/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: testDate,
        departureSlotId: testSlot,
        busStopId: testStop
      });

    expect(bookingRes.status).toBe(201);
    expect(bookingRes.body.success).toBe(true);
    expect(bookingRes.body.booking).toBeDefined();
    expect(bookingRes.body.booking.status).toBe('CONFIRMED');
    expect(bookingRes.body.booking.studentRegNo).toBe('23CSE1045');
  });

  it('7. should prevent hosteller from tampering payload to bypass eligibility', async () => {
    const loginRes = await request(app)
      .post('/api/auth/student/login')
      .send({
        registrationNumber: '23CSE1046',
        password: 'password'
      });

    const token = loginRes.body.token;

    // Send forged body with isHosteller: false
    const bookingRes = await request(app)
      .post('/api/student/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: testDate,
        departureSlotId: testSlot,
        busStopId: testStop,
        isHosteller: false,
        studentId: 'spoofed-id'
      });

    expect(bookingRes.status).toBe(403);
    expect(bookingRes.body.code).toBe('HOSTELLER_NOT_ELIGIBLE');
  });

  it('8. should update eligibility immediately when admin changes student from HOSTELLER to DAY_SCHOLAR', async () => {
    // 1. Hosteller cannot book
    const hostellerRes = await request(app)
      .post('/api/student/bookings')
      .set('X-Simulated-User', '23HS2001')
      .send({
        date: testDate,
        departureSlotId: testSlot,
        busStopId: testStop
      });
    expect(hostellerRes.status).toBe(403);

    // 2. Admin updates student to Day Scholar
    const student = dbStore.students.find(s => s.registrationNumber === '23HS2001');
    expect(student).toBeDefined();

    const updateRes = await request(app)
      .put(`/api/admin/students/${student?.id}`)
      .set('X-Simulated-User', 'ADMIN')
      .send({
        isHosteller: false,
        hostelName: ''
      });
    expect(updateRes.status).toBe(200);

    // 3. Now student CAN book
    const afterUpdateRes = await request(app)
      .post('/api/student/bookings')
      .set('X-Simulated-User', '23HS2001')
      .send({
        date: testDate,
        departureSlotId: testSlot,
        busStopId: testStop
      });
    expect(afterUpdateRes.status).toBe(201);
  });

  it('9. should handle CSV import with validation of unique registration numbers and hosteller flags', async () => {
    const csvContent = `registrationNumber,name,email,department,year,section,isHosteller,hostelName,active
23CSE2001,Kiran Patel,kiran.p@college.edu,Computer Science & Engineering,2,A,false,,true
23CSE2002,Meena Lakshmi,meena.l@college.edu,Computer Science & Engineering,2,B,true,Cauvery Hostel,true`;

    const importRes = await request(app)
      .post('/api/admin/students/import')
      .set('X-Simulated-User', 'ADMIN')
      .send({ csvData: csvContent });

    expect(importRes.status).toBe(200);
    expect(importRes.body.success).toBe(true);
    expect(importRes.body.importedCount).toBe(2);

    const importedHosteller = dbStore.students.find(s => s.registrationNumber === '23CSE2002');
    expect(importedHosteller).toBeDefined();
    expect(importedHosteller?.isHosteller).toBe(true);
  });

  it('10. should block IDOR attempt when student tries to cancel another student booking', async () => {
    // Student 1 books
    const b1Res = await request(app)
      .post('/api/student/bookings')
      .set('X-Simulated-User', '23CSE1045')
      .send({
        date: testDate,
        departureSlotId: testSlot,
        busStopId: testStop
      });
    expect(b1Res.status).toBe(201);
    const bookingId = b1Res.body.booking.id;

    // Student 2 tries to cancel Student 1's booking
    const idorRes = await request(app)
      .delete(`/api/student/bookings/${bookingId}`)
      .set('X-Simulated-User', '23CSE1047');

    expect(idorRes.status).toBe(403);
    expect(idorRes.body.success).toBe(false);
  });
});
