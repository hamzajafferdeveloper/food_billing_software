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
