export interface FoodCategory {
  id: number
  name: string
  image?: string
  created_at?: string
  updated_at?: string
}

export interface FoodItem {
  id: number
  name: string
  price: number
  image?: string
  category_id: number
  addons?: { name: string; price: number }[]
  extras?: { name: string; price: number }[]
  created_at?: string
  updated_at?: string
}

export interface Roles {
    id: number;
    name: string;
    gaurd_name: string;
    created_at?: string;
    updated_at?: string;
}

export interface ExistingEmail {
    email: string;
}

export interface Table {
    id: number;
    table_number: number;
    created_at?: string;
    updated_at?: string;
}

export interface TableWithQrCode extends Table {
    qr_code: string;
}

export interface Order {
    id: number;
    total_amount: string;
    payment_status: string;
    payment_type: string;
    created_at: string;
    customer?: {
        unique_id: string;
        table_id: number;
    };
    cart?: {
        id: number;
        customer_id: string;
        cart_items: {
            food_item_id: number;
            quantity: number;
            food_item?: {
                name: string;
                price: number;
                image?: string;
            };
            addons?: { name: string; price: number }[];
            extras?: { name: string; price: number; quantity: number }[];
            instructions?: string;
        }[];
    };
    payment?: {
        sender_number: string;
        transaction_id: string;
    };
}
