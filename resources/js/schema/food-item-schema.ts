import { z } from 'zod';

export const foodItemSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    price: z.coerce.number().min(0, 'Price must be a positive number'),
    category_id: z.string().min(1, 'Category is required'),
    image: z
        .instanceof(File)
        .optional()
        .refine((file) => {
            if (!file) return true;
            return ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'].includes(file.type);
        }, 'Invalid file type'),
});
