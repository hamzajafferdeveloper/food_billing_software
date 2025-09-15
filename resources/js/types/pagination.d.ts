import { FoodItem } from './data';

export interface Pagination {
    current_page: number;
    data: FoodCategory[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Link[];
    next_page_url: any;
    path: string;
    per_page: number;
    prev_page_url: any;
    to: number;
    total: number;
}
export interface FoodCategoryPagination extends Pagination {
    data: FoodCategory[];
}

export interface FoodItemPagination extends Pagination {
    data: FoodItem[];
}

export interface Link {
    url?: string;
    label: string;
    page?: number;
    active: boolean;
}
