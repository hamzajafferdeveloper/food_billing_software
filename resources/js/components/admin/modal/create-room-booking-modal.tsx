import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import room from '@/routes/admin/room';
import { RoomBookingPayload, roomBookingSchema } from '@/schema/room-booking-schema';
import { Guest, Room } from '@/types';
import { router } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    onOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
}

const CreateRoomBookingModal = ({ onOpen, onOpenChange, title }: Props) => {
    const [guestData, setGuestData] = useState<Guest[]>([]);
    const [documentNumber, setDocumentNumber] = useState('');
    const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
    const [showGuestFields, setShowGuestFields] = useState(false);
    const [isLoadingGuest, setIsLoadingGuest] = useState(false);
    const [openGuestPopover, setOpenGuestPopover] = useState(false);

    const [checkInDate, setCheckInDate] = useState('');
    const [checkInTime, setCheckInTime] = useState('');

    const [roomsData, setRoomsData] = useState<Room[]>([]);
    const [searchRoomInput, setSearchRoomInput] = useState('');
    const [searchRoomQuery, setSearchRoomQuery] = useState('');
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [openRoomPopover, setOpenRoomPopover] = useState(false);
    const [isLoadingRoom, setIsLoadingRoom] = useState(false);
    const [expectedDays, setExpectedDays] = useState<number>(1);

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Close modal on ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onOpenChange(false);
        };
        if (onOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onOpen, onOpenChange]);

    // Fetch guest by document number
    useEffect(() => {
        if (!openGuestPopover) return;

        const fetchGuests = async () => {
            setIsLoadingGuest(true);
            try {
                const res = await fetch(`/admin/rooms/booking/get-guests-for-booking?search=`);
                const json = await res.json();
                setGuestData(json.data || []);
            } catch (err) {
                console.error(err);
                setGuestData([]);
            } finally {
                setIsLoadingGuest(false);
            }
        };

        fetchGuests();
    }, [openGuestPopover]);

    // debounce search query for rooms
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchRoomQuery(searchRoomInput);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchRoomInput]);

    // fetch rooms
    useEffect(() => {
        const fetchRooms = async () => {
            setIsLoadingRoom(true);
            try {
                const res = await fetch(`/admin/rooms/booking/get-rooms-for-booking?search=${encodeURIComponent(searchRoomQuery)}`);
                const result = await res.json();
                setRoomsData(result?.data || []);
            } catch (error) {
                console.error('Error fetching rooms:', error);
            } finally {
                setIsLoadingRoom(false);
            }
        };

        fetchRooms();
    }, [searchRoomQuery]);

    if (!onOpen) return null;

    // handle form submit with validation
    const handleSubmit = () => {
        setErrors({});
        const payload: RoomBookingPayload = {
            guest: selectedGuest
                ? {
                      id: selectedGuest.id,
                      name: selectedGuest.name,
                      document_number: selectedGuest.document_number,
                      phone_number: selectedGuest.phone_number,
                      email: selectedGuest.email,
                      address: selectedGuest.address,
                      document_type: selectedGuest.document_type,
                  }
                : {
                      name: '',
                      // @ts-ignore
                      document_number,
                      phone_number: '',
                      email: '',
                      address: '',
                      document_type: '',
                  },
            room: selectedRoom
                ? {
                      id: selectedRoom.id,
                      number: selectedRoom.number,
                      type: selectedRoom.type,
                  }
                : { id: 0, number: '', type: '' },
            check_in: checkInDate,
            check_in_time: checkInTime,
            expected_days: expectedDays,
        };

        const result = roomBookingSchema.safeParse(payload);

        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.issues.forEach((err) => {
                fieldErrors[err.path.join('.')] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        router.post(room.booking.create.url(), result.data, {
            onSuccess: (page) => {
                console.log('Booking created successfully', page);
            },
            onError: (errors) => {
                console.error('Error creating booking', errors);
                setErrors(errors);
            },
            onFinish: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => onOpenChange(false)}>
            <div className="animate-fadeIn absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"></div>

            <div
                className="animate-scaleIn relative z-10 h-full max-h-[75vh] w-full max-w-7xl transform overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl transition-all dark:bg-gray-900"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="mb-4 flex items-center justify-between border-b pb-3">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title ?? 'Create Room Booking'}</h2>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="cursor-pointer text-xl leading-none text-gray-400 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-300"
                    >
                        <X />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-8 text-gray-700">
                    {/* Guest Section */}
                    <div>
                        <h3 className="mb-3 border-b pb-2 text-base font-semibold text-gray-800 dark:text-gray-100">Guest Information</h3>

                        <div className="mb-4">
                            {!showGuestFields && (
                                <>
                                    <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-100">Document Number</label>
                                    <Popover open={openGuestPopover} onOpenChange={setOpenGuestPopover}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" className="w-full justify-between rounded-lg dark:bg-gray-900 dark:text-gray-100 ">
                                                {documentNumber ? documentNumber : 'Search Ducument Number...'}
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className="max-h-[400px] w-[400px] overflow-auto p-0">
                                            <Command className='dark:bg-gray-900'>
                                                <CommandInput
                                                    placeholder="Search guest by document number..."
                                                    value={documentNumber}
                                                    onValueChange={(val) => {
                                                        setDocumentNumber(val);
                                                        setSelectedGuest(null);
                                                        setShowGuestFields(false);
                                                    }}
                                                />
                                                {isLoadingGuest && <div className="p-3 text-sm text-gray-400 dark:text-gray-100">Searching...</div>}

                                                <CommandEmpty>
                                                    <Button
                                                        className="w-full"
                                                        onClick={() => {
                                                            setShowGuestFields(true);
                                                            setOpenGuestPopover(false);
                                                        }}
                                                        variant="outline"
                                                    >
                                                        Add Guest
                                                    </Button>
                                                </CommandEmpty>

                                                <CommandGroup className="!w-full">
                                                    {guestData.map((guest) => (
                                                        <CommandItem
                                                            key={guest.id}
                                                            onSelect={() => {
                                                                setSelectedGuest(guest);
                                                                setDocumentNumber(guest.document_number);
                                                                setOpenGuestPopover(false);
                                                                setShowGuestFields(true);
                                                            }}
                                                            className="cursor-pointer hover:bg-gray-100"
                                                        >
                                                            {guest.name} - {guest.document_number}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </>
                            )}
                        </div>

                        {/* Guest Fields */}
                        {showGuestFields && (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-100">Guest Name</label>
                                    <Input
                                        placeholder="Enter guest name"
                                        className="dark:text-gray-100"
                                        value={selectedGuest?.name || ''}
                                        onChange={(e) => setSelectedGuest((prev) => ({ ...prev, name: e.target.value }) as Guest)}
                                    />
                                    {errors['guest.name'] && <p className="text-sm text-red-500">{errors['guest.name']}</p>}
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-100">Phone Number</label>
                                    <Input
                                        placeholder="Enter phone number"
                                        className="dark:text-gray-100"
                                        value={selectedGuest?.phone_number || ''}
                                        onChange={(e) =>
                                            setSelectedGuest(
                                                (prev) =>
                                                    ({
                                                        ...prev,
                                                        phone_number: e.target.value,
                                                    }) as Guest,
                                            )
                                        }
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-100">Email Address</label>
                                    <Input
                                        placeholder="Enter email address"
                                        className="dark:text-gray-100"
                                        value={selectedGuest?.email || ''}
                                        onChange={(e) => setSelectedGuest((prev) => ({ ...prev, email: e.target.value }) as Guest)}
                                    />
                                    {errors['guest.email'] && <p className="text-sm text-red-500">{errors['guest.email']}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-100">Address</label>
                                    <Input
                                        className="dark:text-gray-100"
                                        placeholder="Enter address"
                                        value={selectedGuest?.address || ''}
                                        onChange={(e) => setSelectedGuest((prev) => ({ ...prev, address: e.target.value }) as Guest)}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-100">Document Type</label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="w-full">
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between rounded-lg dark:bg-gray-900 dark:text-gray-100"
                                            >
                                                {selectedGuest?.document_type ? selectedGuest?.document_type : 'Select document type...'}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={() => setSelectedGuest((prev) => ({ ...prev, document_type: 'national_id' }) as Guest)}
                                            >
                                                National ID
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={() => setSelectedGuest((prev) => ({ ...prev, document_type: 'driver_license' }) as Guest)}
                                            >
                                                Driver License
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={() => setSelectedGuest((prev) => ({ ...prev, document_type: 'passport' }) as Guest)}
                                            >
                                                Passport Number
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-100">Document Number</label>
                                    <Input
                                        placeholder="Enter document number"
                                        className="dark:text-gray-100"
                                        value={selectedGuest?.document_number || documentNumber}
                                        onChange={(e) => {
                                            setDocumentNumber(e.target.value);
                                            setSelectedGuest(
                                                (prev) =>
                                                    ({
                                                        ...prev,
                                                        document_number: e.target.value,
                                                    }) as Guest,
                                            );
                                        }}
                                    />
                                    {errors['guest.document_number'] && <p className="text-sm text-red-500">{errors['guest.document_number']}</p>}
                                </div>
                            </div>
                        )}
                        {showGuestFields && (
                            <Button
                                className="mt-2 dark:border-gray-100 dark:bg-gray-900 dark:text-gray-100"
                                onClick={() => {
                                    setShowGuestFields(false);
                                    setSelectedGuest(null);
                                }}
                                variant="outline"
                            >
                                Reset Guest
                            </Button>
                        )}
                    </div>

                    {/* Room Section */}
                    <div>
                        <h3 className="mb-3 border-b pb-2 text-base font-semibold text-gray-800 dark:text-gray-100">Room Details</h3>
                        <div className="flex flex-col gap-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-100">Room Number</label>
                                <Popover open={openRoomPopover} onOpenChange={setOpenRoomPopover}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-full justify-between rounded-lg dark:bg-gray-900 dark:text-gray-100"
                                        >
                                            {selectedRoom ? selectedRoom.number : 'Select room...'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="max-h-[400px] w-[400px] overflow-auto p-0">
                                        <Command className="dark:bg-gray-900">
                                            <CommandInput
                                                placeholder="Search room by number or type..."
                                                value={searchRoomInput}
                                                onValueChange={setSearchRoomInput}
                                            />
                                            {isLoadingRoom && <div className="p-3 text-sm text-gray-400 dark:text-gray-100">Searching...</div>}
                                            {!isLoadingRoom && roomsData.length === 0 && <CommandEmpty>No rooms found.</CommandEmpty>}
                                            <CommandGroup>
                                                {roomsData.map((room) => (
                                                    <CommandItem
                                                        key={room.id}
                                                        onSelect={() => {
                                                            setSelectedRoom(room);
                                                            setSearchRoomInput(room.number);
                                                            setOpenRoomPopover(false);
                                                        }}
                                                        className="cursor-pointer hover:bg-gray-100"
                                                    >
                                                        {room.number} - {room.type}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {errors['room.number'] && <p className="text-sm text-red-500">{errors['room.number']}</p>}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-100">Check-in Date</label>
                                    <Input
                                        type="date"
                                        value={checkInDate}
                                        className="dark:text-gray-100"
                                        onChange={(e) => setCheckInDate(e.target.value)}
                                    />
                                    {errors['check_in'] && <p className="text-sm text-red-500">{errors['check_in']}</p>}
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-100">Check-in Time</label>
                                    <Input
                                        type="time"
                                        className="dark:text-gray-100"
                                        value={checkInTime}
                                        onChange={(e) => setCheckInTime(e.target.value)}
                                    />
                                    {errors['check_in_time'] && <p className="text-sm text-red-500">{errors['check_in_time']}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-100">Expected Days</label>
                                <Input
                                    type="number"
                                    className="dark:text-gray-100"
                                    value={expectedDays}
                                    onChange={(e) => setExpectedDays(Number(e.target.value))}
                                    min={0}
                                />
                                {errors['expected_days'] && <p className="text-sm text-red-500">{errors['expected_days']}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end space-x-3 border-t pt-3">
                    <Button className='dark:bg-gray-900' onClick={() => onOpenChange(false)} variant="outline">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Save</Button>
                </div>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-fadeIn { animation: fadeIn 0.08s ease-out; }
                .animate-scaleIn { animation: scaleIn 0.08s ease-out; }
            `}</style>
        </div>
    );
};

export default CreateRoomBookingModal;
