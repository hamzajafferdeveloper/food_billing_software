import { z } from 'zod';

const passwordSchema = z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, {
    message: 'Password must contain at least one letter and one number',
});


export const UserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    number: z.string().min(10, 'Phone number must be at least 10 characters'),
    password: passwordSchema,
    password_confirmation: z.string(),
    role_id: z.string().min(1, 'Category is required'),
});

export const EditUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    number: z.string().min(10, 'Phone number must be at least 10 characters'),
    password: passwordSchema.or(z.literal('')).optional(),
    password_confirmation: z.string().optional(),
    role_id: z.string().min(1, 'Category is required'),
});
