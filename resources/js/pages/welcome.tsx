import { Button } from '@/components/ui/button';
import { resizeSvg } from '@/lib/utils';
import { TableWithQrCode } from '@/types/data';
import { Head, router } from '@inertiajs/react';

export default function Welcome({ tables }: { tables: TableWithQrCode[] }) {
    return (
        <section className='max-h-screen scroll-y-auto'>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className='flex justify-end p-4'>
                <Button onClick={() => router.visit('/login')}>Login</Button>
            </div>
            <div>
                <h1 className="text-3xl font-bold text-center my-6">Welcome to Red Pepper Resturant</h1>
                <p className="text-center mb-6 text-gray-600">Scan the QR code below to view the menu and place your order.</p>
            </div>
            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {tables.length === 0 ? (
                    <p>No Table Found</p>
                ) : (
                    <div className="w-full my-auto max-w-5xl gap-10 mx-auto flex flex-wrap p-4">
                        {tables.map((table) => (
                            <div className='p-2 border gap-4 rounded-md shadow-xl items-center flex flex-col' key={table.id}>
                                <div dangerouslySetInnerHTML={{ __html: resizeSvg(table.qr_code, 200, 200) }} />
                                <p>Table: { table.table_number }</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
