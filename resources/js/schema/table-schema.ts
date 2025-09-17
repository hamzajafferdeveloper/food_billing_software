import { z } from 'zod';

export const tableSchema = z.object({
    table_number: z.coerce.number().min(0, "Table number must be a positive number"),
});
