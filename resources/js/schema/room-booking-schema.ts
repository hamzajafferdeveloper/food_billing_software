import { z } from 'zod';

export const guestSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Guest name is required'),
  document_number: z.string().min(1, 'Document number is required'),
  phone_number: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
  address: z.string().optional(),
  document_type: z.string().optional(),
});

export const roomSchema = z.object({
  id: z.number(),
  number: z.string().min(1, 'Room number is required'),
  type: z.string().min(1, 'Room type is required'),
});

// Add refinement to check that check_out > check_in
export const roomBookingSchema = z
  .object({
    guest: guestSchema,
    room: roomSchema,
    check_in: z.string().min(1, 'Check-in date is required'),
    check_in_time: z.string().min(1, 'Check-in time is required'),
    expected_days: z.number().min(1, 'Number of days is required'),
  });

export type RoomBookingPayload = z.infer<typeof roomBookingSchema>;
