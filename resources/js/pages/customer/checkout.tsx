import { CustomerSidebarHeader } from '@/components/customer/customer-sidebar-header';
import CustomerSideBarLayout from '@/layouts/customer/customer-layout';
import { storeUniqueId } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';

export default function CheckOut({ uniqueId, order }: { uniqueId: string; order: any }) {
    useEffect(() => {
        storeUniqueId(uniqueId);
    }, [uniqueId]);

    return (
        <CustomerSideBarLayout>
            <Head title="CheckOut" />
            <CustomerSidebarHeader />
            <section className="flex mt-40 items-center justify-center">
                <div className="w-full max-w-lg border border-gray-200">
                    <h1 className="bg-[#fce0a2] p-4 text-center font-bold text-[#171717]">Make Payment</h1>
                    <div className="mx-auto flex w-full max-w-sm flex-col items-center justify-center gap-3">
                        <p className="p-4 text-center text-gray-600">Total Amount: ${order.total_amount}</p>
                        <p className="text-center font-bold">
                            Scan the QR Code from Payment App Or, Use the given Merchatn Number for offline Payment
                        </p>
                        <img className="h-auto w-64" src="/storage/images/payment_qr-code.png" />
                        <p className="text-center font-bold">
                            ** After payment, submit the Transaction ID & Sender Number <Link href={`/${uniqueId}/notification`} className="text-blue-700">HERE</Link> **
                        </p>
                    </div>
                </div>
            </section>
        </CustomerSideBarLayout>
    );
}
