import CustomerSideBarLayout from '@/layouts/customer/customer-sidebar-layout';
import { useEffect, type ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { setCart } from "@/store/cartSlice";
import { getStoredUniqueId } from '@/lib/utils';
interface AppLayoutProps {
    children: ReactNode;
}

export default ({ children, ...props }: AppLayoutProps) => {
    const dispatch = useDispatch();
    const uniqueId = getStoredUniqueId();

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const response = await fetch(`/${uniqueId}/get-cart`);
                if (!response.ok) return;
                const data = await response.json();
                dispatch(setCart(data.items));
            } catch (error) {
                console.error('Failed to load cart:', error);
            }
        };

        fetchCart();
    }, [dispatch]);
    return (
        <CustomerSideBarLayout {...props}>
            {children}
        </CustomerSideBarLayout>
    );
};
