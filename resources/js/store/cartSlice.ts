// store/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    subtotal?: number;
    instructions?: string;
}

interface CartState {
    items: CartItem[];
}

const initialState: CartState = {
    items: [],
};

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const existing = state.items.find((i) => i.id === action.payload.id);
            if (existing) {
                existing.quantity += action.payload.quantity;
            } else {
                state.items.push(action.payload);
            }
        },
        setCart: (state, action: PayloadAction<CartItem[]>) => {
            state.items = action.payload;
        },
        removeFromCart: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter((i) => i.id !== action.payload);
        },
        clearCart: (state) => {
            state.items = [];
        },
    },
});

export const { addToCart, removeFromCart, clearCart, setCart } = cartSlice.actions;
export default cartSlice.reducer;
