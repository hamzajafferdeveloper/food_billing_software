import { z } from 'zod';

export const foodCategorySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    image: z
        .instanceof(File)
        .optional()
        .refine((file) => {
            if (!file) return true;
            return ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'].includes(file.type);
        }, 'Invalid file type'),
});
