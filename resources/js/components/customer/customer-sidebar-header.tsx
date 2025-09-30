import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { SidebarTrigger } from '../ui/sidebar';
import { router } from '@inertiajs/react';
import { getStoredUniqueId } from '@/lib/utils';

export function CustomerSidebarHeader() {
    const count = useSelector((state: RootState) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
    const uniqueId = getStoredUniqueId();

    return (
        <header className="w-full shrink-0 items-center gap-2 border-b border-sidebar-border px-6 py-2 transition-[width,height] ease-linear">
            <div className="flex items-center justify-between gap-2">
                <SidebarTrigger />
                <Button onClick={() => router.get(`/${uniqueId}/cart`)} className="btn-primary cursor-pointer">Added Items ({count})</Button>
            </div>
        </header>
    );
}
