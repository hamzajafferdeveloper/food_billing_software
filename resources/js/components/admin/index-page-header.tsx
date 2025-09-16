import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface Props {
    title: string;
    btnText: string;
    onClick: () => void;
    baseUrl: string;
    searchPlaceHolder: string;
    searchValue: string;
    setSearchValue: (value: string) => void;
}

const IndexPageHeader = ({ title, btnText, onClick, baseUrl, searchPlaceHolder, searchValue, setSearchValue }: Props) => {

    useEffect(() => {
        if (searchValue) {
            router.get(baseUrl, { search: searchValue }, { preserveState: true, replace: true });
        } else {
            router.get(baseUrl, {}, { preserveState: true, replace: true });
        }
    }, [searchValue]);
    return (
        <header className="mb-4 md:flex items-center w-full justify-between">
            <div className="flex items-center gap-4 w-full">
                <h1 className="text-xl font-medium">{title}</h1>
                <Input placeholder={searchPlaceHolder} value={searchValue} onChange={(e) => setSearchValue(e.target.value)} className="max-w-sm" />
            </div>
            <Button className="cursor-pointer" onClick={onClick}>
                {btnText}
            </Button>
        </header>
    );
};

export default IndexPageHeader;
