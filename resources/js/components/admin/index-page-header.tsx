import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface Props {
    title: string;
    btnText: string;
    onClick: () => void;
    baseUrl: string;
    searchPlaceHolder?: string;
    searchValue?: string;
    setSearchValue?: (value: string) => void;
}

const IndexPageHeader = ({ title, btnText, onClick, baseUrl, searchPlaceHolder, searchValue, setSearchValue }: Props) => {
    const { auth } = usePage<SharedData>().props;

    useEffect(() => {
        if (searchValue) {
            router.get(baseUrl, { search: searchValue }, { preserveState: true, replace: true });
        } else {
            router.get(baseUrl, {}, { preserveState: true, replace: true });
        }
    }, [searchValue]);
    return (
        <header className="mb-4 w-full items-center px-4 py-2 rounded-2xl justify-between md:flex">
            <div className="flex w-full items-center gap-4">
                <h1 className="text-xl font-medium">{title}</h1>
                {setSearchValue && (
                    <Input
                        placeholder={searchPlaceHolder}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="max-w-sm"
                    />
                )}
            </div>
            {auth && auth.roles.includes('admin') && (
                <Button className="cursor-pointer" onClick={onClick}>
                    {btnText}
                </Button>
            )}
        </header>
    );
};

export default IndexPageHeader;
