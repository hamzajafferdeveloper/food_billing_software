import { z } from "zod";

const optionSchema = z.object({
    name: z.string().min(1, "Name is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
});

export const foodItemSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    price: z.coerce.number().min(0, "Price must be a positive number"),
    category_id: z.string().min(1, "Category is required"),

    // ✅ New fields
    addons: z.array(optionSchema).optional(),
    extras: z.array(optionSchema).optional(),

    image: z
        .instanceof(File)
        .optional()
        .refine(
            (file) => {
                if (!file) return true;
                return [
                    "image/jpeg",
                    "image/png",
                    "image/jpg",
                    "image/gif",
                    "image/svg+xml",
                ].includes(file.type);
            },
            { message: "Invalid file type" }
        )
        .refine(
            (file) => {
                if (!file) return true;
                return file.size <= 2 * 1024 * 1024; // 2MB
            },
            { message: "File must be less than 2MB" }
        ),
});
