import { Booking } from '../../../src/types';
import { dbStore } from '../../db';
import { authService } from './auth.service';

export class BookingService {
  public async getBookingsForUser(userId: string, userRole: string): Promise<Booking[]> {
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'DISPATCHER') {
      return dbStore.bookings;
    }
    const student = dbStore.students.find(s => 
      s.id === userId || 
      s.registrationNumber?.toUpperCase() === userId.toUpperCase() ||
      s.studentId === userId ||
      s.userId === userId
    );
    const user = dbStore.users.find(u => 
      u.id === userId || 
      u.username?.toUpperCase() === userId.toUpperCase() ||
      u.studentProfile?.registrationNumber?.toUpperCase() === userId.toUpperCase()
    );

    const validIds = new Set<string>([userId]);
    if (student) {
      if (student.id) validIds.add(student.id);
      if (student.studentId) validIds.add(student.studentId);
      if (student.registrationNumber) validIds.add(student.registrationNumber);
      if (student.userId) validIds.add(student.userId);
    }
    if (user) {
      if (user.id) validIds.add(user.id);
      if (user.studentProfile?.studentId) validIds.add(user.studentProfile.studentId);
      if (user.studentProfile?.registrationNumber) validIds.add(user.studentProfile.registrationNumber);
    }

    return dbStore.bookings.filter(b => 
      validIds.has(b.studentId) || 
      (b.studentRegNo && validIds.has(b.studentRegNo))
    );
  }

  public async createBooking(
    authenticatedUserId: string,
    date: string,
    slotId: string,
    stopId: string
  ): Promise<{ success: boolean; booking?: Booking; error?: string; code?: string }> {
    // Call atomic locking creation on database store
    const result = await dbStore.createBookingAtomic(authenticatedUserId, date, slotId, stopId);
    return result;
  }

  public async cancelBooking(
    authenticatedUserId: string,
    bookingId: string,
    isAdmin: boolean = false,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    const result = dbStore.cancelBooking(authenticatedUserId, bookingId, isAdmin, reason);
    return result;
  }
}

export const bookingService = new BookingService();

