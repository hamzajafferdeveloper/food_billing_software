import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';
import { ArrowUpDown, Banknote, PenBox, ReceiptText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import room from '@/routes/admin/room';
import { RoomBooking } from '@/types';
import { roomBookingsPagination } from '@/types/pagination';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import PaginationLink from '../pagination-link';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import EditRoomBookingModal from './modal/edit-room-booking-modal';

type Props = {
    roomBookingsPagination: roomBookingsPagination;
};

export function RoomBookingTable({ roomBookingsPagination }: Props) {
    const data = roomBookingsPagination.data;

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [selectedRoom, setSelectedRoom] = useState<RoomBooking | null>(null);
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
    const [receiptData, setReceiptData] = useState();

    const handleEditClick = (room: RoomBooking) => {
        setSelectedRoom(room);
        setEditModalOpen(true);
    };

    const handleCashPaid = (roomData: RoomBooking) => {
        router.post(room.bill_paid.url(roomData.id));
    };

    const handleReceiptClick = async (roomData: RoomBooking) => {
        try {
            const response = await fetch(room.receipt.url(roomData.id));
            const result = await response.json();

            if (!result.success) {
                toast.error('Failed to load receipt data');
                return;
            }

            const data = result.data;
            const { room: roomInfo, guest, room_bill, check_in, check_out } = data;

            console.log(data);

            // 🧾 Combine all items from filtered orders
            const allCartItems: any[] = [];

            // 🧠 Filter orders between check_in and check_out
            const allOrders = roomInfo?.orders || [];

            allOrders.forEach((order: any) => {
                order.cart?.cart_items?.forEach((item: any) => {
                    if (item.food_item) {
                        allCartItems.push({
                            id: item.food_item.id,
                            name: item.food_item.name,
                            price: parseFloat(item.food_item.price || 0),
                            quantity: item.quantity,
                            addons: item.addons || [],
                            extras: item.extras || [],
                        });
                    }
                });
            });

            // 🧮 Merge same items (sum quantities)
            const mergedItems = Object.values(
                allCartItems.reduce((acc: any, item: any) => {
                    if (!acc[item.id]) {
                        acc[item.id] = { ...item };
                    } else {
                        acc[item.id].quantity += item.quantity;
                    }
                    return acc;
                }, {}),
            );

            // 🧾 Format date
            const formatDate = (d: string) =>
                new Date(d).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });

            let ordersHtml = mergedItems
                .map(
                    (item: any) => `
                        <div style="margin-top:4px;">
                            ${item.name} x${item.quantity}
                            <span style="float:right;">$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        ${item.addons?.length ? `<div style="font-size:11px;margin-left:8px;">Addons: ${item.addons.map((a: any) => a.name).join(', ')}</div>` : ''}
                        ${item.extras?.length ? `<div style="font-size:11px;margin-left:8px;">Extras: ${item.extras.map((a: any) => a.name).join(', ')}</div>` : ''}
                    `,
                )
                .join('');

            // 🧮 Totals
            const totalFoodBill = room_bill?.food_bill ?? 0;
            const totalRoomBill = room_bill?.room_bill ?? 0;
            const totalAmount = room_bill?.total_amount ?? 0;

            // 🖨️ Print Receipt
            const printWindow = window.open('', '', 'width=900,height=600');
            if (!printWindow) return;

            printWindow.document.write(`
            <html>
                <head>
                    <title>Receipt - ${roomInfo?.number || 'Room'}</title>
                    <style>
                        @page { size: 80mm auto; margin: 5mm; }
                        body {
                            font-family: 'Courier New', monospace;
                            width: 80mm;
                            margin: 0 auto;
                            color: #000;
                            font-size: 13px;
                        }
                        h2, h3 {
                            text-align: center;
                            margin: 0;
                        }
                        .divider {
                            border-top: 1px dashed #000;
                            margin: 8px 0;
                        }
                    </style>
                </head>
                <body>
                    <h2>Hotel Receipt</h2>
                    <div style="text-align:center;margin-bottom:5px;">Room: <strong>${roomInfo?.number}</strong></div>
                    <div>Guest: ${guest?.name ?? '-'}</div>
                    <div>Document: ${guest?.document_number ?? '-'}</div>
                    <div>Check-In: ${formatDate(check_in)}</div>
                    <div>Check-Out: ${formatDate(check_out)}</div>
                    <div class="divider"></div>
                    <div><strong>Orders:</strong></div>
                    ${ordersHtml || '<div>No food orders during stay.</div>'}
                    <div class="divider"></div>
                    <div><strong>Room Bill:</strong> $${totalRoomBill}</div>
                    <div><strong>Food Bill:</strong> $${totalFoodBill}</div>
                    <div style="border-top:1px solid #000;margin-top:8px;padding-top:5px;">
                        <strong>Total Amount:</strong> $${totalAmount}
                    </div>
                    <div style="text-align:center;margin-top:10px;">Thank you for staying!</div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(() => window.close(), 1000);
                        };
                    </script>
                </body>
            </html>
        `);

            printWindow.document.close();
        } catch (error) {
            console.error('Error fetching receipt:', error);
        }
    };

    const handleStatusUpdate = (id: number, status: string) => {
        try {
            router.put(room.booking.update.status.url(id), { status });
        } catch (error) {
            console.error(error);
        }
    };

    const columns: ColumnDef<RoomBooking>[] = [
        {
            accessorKey: 'guest',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Guest
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="ml-2 lowercase">
                    <h1>{row.original.guest?.name}</h1>
                    <p>{row.original.guest?.document_number}</p>
                </div>
            ),
        },
        {
            accessorKey: 'guest.email',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Email
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => <div className="ml-2 lowercase">{row.original.guest?.email}</div>,
        },
        {
            accessorKey: 'guest.phone_number',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Phone Number
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => <div className="ml-2 lowercase">{row.original.guest?.phone_number}</div>,
        },
        {
            accessorKey: 'room.number',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Room Number
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => <div className="ml-2 lowercase">{row.original.room?.number}</div>,
        },
        {
            accessorKey: 'expected_days',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Expected Days
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => <div className="ml-2 lowercase">{row.original.expected_days}</div>,
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Status
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="ml-2 lowercase">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="w-full">
                            <Button variant="outline" role="combobox" className="w-full cursor-pointer justify-between rounded-lg border">
                                {row.original.status ? (
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`h-2 w-2 rounded-full ${
                                                row.original.status === 'active'
                                                    ? 'bg-blue-500'
                                                    : row.original.status === 'checked_out'
                                                      ? 'bg-green-500'
                                                      : 'bg-red-500'
                                            }`}
                                        />{' '}
                                        {row.original.status}
                                    </div>
                                ) : (
                                    'Select status...'
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        {row.original.status === 'active' && (
                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    className="cursor-pointer hover:!bg-blue-300/50"
                                    onClick={() => handleStatusUpdate(row.original.id, 'active')}
                                >
                                    <div className="h-2 w-2 rounded-full bg-blue-500" /> Active
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer hover:!bg-green-300/50"
                                    onClick={() => handleStatusUpdate(row.original.id, 'checked_out')}
                                >
                                    <div className="h-2 w-2 rounded-full bg-green-500" /> Check Out
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer hover:!bg-red-300/50"
                                    onClick={() => handleStatusUpdate(row.original.id, 'cancelled')}
                                >
                                    <div className="h-2 w-2 rounded-full bg-red-500" /> Cancelled
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        )}
                    </DropdownMenu>
                </div>
            ),
        },
        {
            accessorKey: 'check_in',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Check In
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => <div className="ml-2 lowercase">{row.getValue('check_in')}</div>,
        },
        {
            accessorKey: 'check_out',
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Check Out
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => {
                return row.getValue('check_out') ? (
                    <div className="ml-2 w-full text-gray-700 lowercase">{row.getValue('check_out')}</div>
                ) : (
                    <div className="w-full py-1 text-center">------</div>
                );
            },
        },
        {
            id: 'actions',
            enableHiding: false,
            header: () => <Button variant="ghost">Action</Button>,
            cell: ({ row }) => {
                const room = row.original;
                return (
                    <div className="mr-4 flex cursor-pointer justify-center gap-2">
                        <div className="rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600">
                            <PenBox onClick={() => handleEditClick(room)} className="cursor-pointer" size={15} />
                        </div>

                        {room.status === 'checked_out' && (
                            <div className="mr-4 flex cursor-pointer justify-center gap-2">
                                <div className="rounded-md bg-gray-500 p-2 text-white hover:bg-gray-600">
                                    <ReceiptText className="cursor-pointer" onClick={() => handleReceiptClick(room)} size={15} />
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        {room.room_bill.payment_status === 'paid' ? (
                                            <div className="rounded-md bg-green-400 p-2 text-white opacity-50 hover:bg-green-600">
                                                <Banknote className="cursor-pointer" size={15} />
                                            </div>
                                        ) : (
                                            <div className="rounded-md bg-green-500 p-2 text-white hover:bg-green-600">
                                                <Banknote className="cursor-pointer" onClick={() => handleCashPaid(room)} size={15} />
                                            </div>
                                        )}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Cash Paid</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        )}
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div className="w-full">
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <PaginationLink pagination={roomBookingsPagination} currentPageLink={room.booking.index().url} />

            {selectedRoom && <EditRoomBookingModal onOpen={editModalOpen} onOpenChange={setEditModalOpen} booking={selectedRoom} />}
        </div>
    );
}
