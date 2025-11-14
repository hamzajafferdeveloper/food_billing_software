import { Button } from '@/components/ui/button';
import { resizeSvg } from '@/lib/utils';
import { SharedData } from '@/types';
import { TableWithQrCode } from '@/types/data';
import { Head, router, usePage } from '@inertiajs/react';

export default function Welcome({ tables }: { tables: TableWithQrCode[] }) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    return (
        <section className="scroll-y-auto max-h-screen">
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex justify-end p-4">
                {auth.user ? (
                    <>
                        {auth.roles.includes('admin') || auth.roles.includes('manager') && (
                            <Button className="mr-2" onClick={() => router.visit('/admin/dashboard')}>
                               Admin Dashboard
                            </Button>
                        )}
                        {auth.roles.includes('chief') ? (
                            <Button className="mr-2" onClick={() => router.visit('/admin/dashboard')}>
                               Chief Dashboard
                            </Button>
                        ) : null}
                        <Button variant="outline" onClick={() => router.post('/logout')}>
                            Logout
                        </Button>
                    </>
                ) : (
                    <Button onClick={() => router.visit('/login')}>Login</Button>
                )}
            </div>
            <div>
                <h1 className="my-6 text-center text-3xl font-bold">Welcome to Red Pepper Resturant</h1>
                {auth.user && <h2 className="my-6 text-center text-2xl font-bold">You are logged in as {auth.user.name}</h2>}

                <p className="mb-6 text-center text-gray-600">Scan the QR code below to view the menu and place your order.</p>
            </div>
            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {tables.length === 0 ? (
                    <p>No Table Found</p>
                ) : (
                    <div className="mx-auto my-auto flex w-full max-w-5xl flex-wrap gap-10 p-4">
                        {tables.map((table) => (
                            <div
                                onClick={() => router.visit(`/table-number=${table.table_number}`)}
                                className="flex cursor-pointer flex-col items-center gap-4 rounded-md border p-2 shadow-xl"
                                key={table.id}
                            >
                                <div dangerouslySetInnerHTML={{ __html: resizeSvg(table.qr_code, 200, 200) }} />
                                <p>Table: {table.table_number}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
