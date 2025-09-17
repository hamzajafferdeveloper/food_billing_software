export interface FoodItemValidationErrors {
    name?: string;
    price?: string;
    category_id?: string;
    image?: string;
}

export interface FoodCategoryValidationErrors {
    name?: string;
    image?: string;
}

export interface UserValidationErrors {
    name?: string;
    email?: string;
    number?: string;
    password?: string;
    password_confirmation?: string;
    role?: string;
}

export interface TableValidationErrors {
    table_number?: string;
}
