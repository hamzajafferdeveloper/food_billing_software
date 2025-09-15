import { login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className='flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900'>
                <Link href={login()} className="text-sm text-gray-700 underline dark:text-gray-500">Login</Link>
            </div>
        </>
    );
}
