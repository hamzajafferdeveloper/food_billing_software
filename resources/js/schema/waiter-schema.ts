import { z } from 'zod';

const passwordSchema = z
    .string()
    .optional()
    .refine(
        (val) =>
            !val || /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(val),
        {
            message: 'Password must contain at least one letter, one number, and one special character',
        }
    );


export const WaiterSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    number: z.string().min(10, 'Phone number must be at least 10 characters'),
    password: passwordSchema,
    password_confirmation: z.string(),
});

export const EditWaiterSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    number: z.string().min(10, 'Phone number must be at least 10 characters'),
    password: passwordSchema, // ✅ No duplicate logic
    password_confirmation: z.string().optional(),
});
