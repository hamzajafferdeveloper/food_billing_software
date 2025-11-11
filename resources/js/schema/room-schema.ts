import { z } from 'zod';

export const roomSchema = z.object({
    number: z.string().min(1, 'Room number is required'),
    type: z.string().min(1, 'Room type is required'),
    price_per_night: z.coerce.number().min(0, 'Price per night must be a positive number'),
    note: z.string().optional()
});
