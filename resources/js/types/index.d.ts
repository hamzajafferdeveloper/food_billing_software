import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';
import { Roles } from './data';

export interface Auth {
    user: User;
    roles: string[];
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    subMenu?: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    currency: string;
    site_title: string;
    site_logo: string;
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone_number?: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles: Roles[];

    [key: string]: unknown; // This allows for additional properties...
}

export interface Room {
    id: number;
    number: string;
    type: string;
    status: string;
    price_per_night: number;
    note: string;
    created_at: string;
    updated_at: string;
}

export interface RoomBooking {
    id: number;
    room_id: number;
    guest_id: number;
    status: string;
    check_in: string;
    check_out: string;
    expected_days: number;
    room: Room;
    guest: Guest;
    room_bill: RoomBill;
    total_amount: number;
    created_at: string;
    updated_at: string;
}

export interface Guest {
    id: number;
    name: string;
    email: string;
    address: string;
    phone_number: string;
    document_type: string;
    document_number: string;
    created_at: string;
    updated_at: string;
}
