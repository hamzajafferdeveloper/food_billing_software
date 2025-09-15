import { Button } from '../ui/button';

interface Props {
    title: string;
    btnText: string;
    onClick: () => void;
}

const IndexPageHeader = ({ title, btnText, onClick }: Props) => {
    return (
        <header className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-medium">{title}</h1>
            <Button className='cursor-pointer' onClick={onClick}>{btnText}</Button>
        </header>
    );
};

export default IndexPageHeader;
