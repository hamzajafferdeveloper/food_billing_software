import { resizeSvg } from '@/lib/utils';
import { TableWithQrCode } from '@/types/data';
import { Head } from '@inertiajs/react';

export default function Welcome({ tables }: { tables: TableWithQrCode[] }) {
    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {tables.length === 0 ? (
                    <p>No Table Found</p>
                ) : (
                    <div className="w-full h-full grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                        {tables.map((table) => (
                            <div className='p-2 border gap-4 rounded-md shadow-xl items-center flex flex-col' key={table.id}>
                                <div dangerouslySetInnerHTML={{ __html: resizeSvg(table.qr_code, 200, 200) }} />
                                <p>Table: { table.table_number }</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
