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
    created_at: string;
    waiter_id?: number;
    room_id?: number;
    payment_type?: 'cash' | 'online';
    customer?: {
        unique_id: string;
        table_id: number;
    };
    cart?: {
        id: number;
        customer_id: string;
        cart_items: {
            instructions?: string;
            food_item_id: number;
            quantity: number;
            food_item?: {
                name: string;
                price: number;
                image?: string;
            };
            addons?: {
                item_id: number;
                name: string;
                price: number;
            }[];
            extras?: {
                item_id: number;
                quantity: number;
                name: string;
                price: number;
            }[];
            totalPrice?: number;
        }[];
    };
    room?: {
        id: number;
        number: string;
    }
    payment?: {
        sender_number: string;
        transaction_id: string;
    };
    waiter?: {
        id: number;
        name: string;
    };
}
