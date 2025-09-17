import { ConfirmDialog } from '@/components/confirm-dialogbox';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { TableWithQrCode } from '@/types/data';
import table from '@/routes/admin/table';
import { resizeSvg } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const TableWithQrCodeCard = ({ data }: { data: TableWithQrCode }) => {
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const qrRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if (!qrRef.current) return;
        const content = qrRef.current.innerHTML;

        const printWindow = window.open('', '', 'height=800,width=800');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print QR Code</title>
                    <style>
                        body {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                        }
                        svg {
                            width: 200px;
                            height: 200px;
                        }
                    </style>
                </head>
                <body>
                    ${content}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    return (
        <div>
            <Card className="group relative max-w-[230px] shadow-lg gap-1 overflow-hidden py-0 pb-6">
                <CardHeader className="relative items-center flex flex-col p-2">
                    {/* QR Code */}
                    <div
                        ref={qrRef}
                        dangerouslySetInnerHTML={{ __html: resizeSvg(data.qr_code, 200, 200) }}
                    />

                    {/* Hover Icons */}
                    <div className="absolute top-2 right-2 z-20 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <button
                            className="rounded-md bg-white p-1 shadow hover:bg-gray-100"
                            onClick={() => setDeleteModalOpen(true)}
                        >
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                    </div>
                </CardHeader>

                <CardFooter className="flex justify-between">
                    <p className="text-lg font-semibold">
                        Table {data.table_number}
                    </p>
                    <Button className='cursor-pointer' onClick={handlePrint}>Print</Button>
                </CardFooter>
            </Card>

            <ConfirmDialog
                onOpen={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                onConfirm={() => {
                    router.delete(table.destroy(data.id).url);
                }}
                title="Delete Table"
                description="This action cannot be undone. This will permanently delete the table and remove it from our servers."
            />
        </div>
    );
};

export default TableWithQrCodeCard;
