import AdminSidebarLayout from '@/layouts/admin/admin-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save, ImageIcon } from 'lucide-react';
import { update } from '@/routes/admin/settings';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/settings' },
];

export default function SettingsPage({
    settings,
}: {
    settings: { currency: string; title: string; logo: string | null };
}) {
    const { props } = usePage<SharedData & { flash?: { success?: string } }>();
    const [logoPreview, setLogoPreview] = useState<string | null>(`/storage/${settings.logo}` || null);

    const { data, setData, post, processing, errors } = useForm({
        currency: settings.currency || '',
        title: settings.title || '',
        logo: null as File | null,
    });

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
    }, [props.flash?.success]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(update().url, {
            forceFormData: true,
        });
    };

    return (
        <AdminSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />

            <div className="flex h-full flex-1 justify-center items-start p-4">
                <Card className="w-full max-w-lg border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">General Settings</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Logo Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="logo" className="text-sm font-medium">
                                    Site Logo
                                </Label>

                                <div className="flex items-center gap-4">
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt="Logo Preview"
                                            className="h-16 w-16 rounded-lg object-contain border"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 flex items-center justify-center rounded-lg border bg-gray-50 text-gray-400">
                                            <ImageIcon size={24} />
                                        </div>
                                    )}

                                    <Input
                                        id="logo"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="flex-1 cursor-pointer"
                                    />
                                </div>

                                {errors.logo && (
                                    <p className="mt-1 text-sm text-red-500">{errors.logo}</p>
                                )}
                            </div>

                            {/* Site Title */}
                            <div>
                                <Label htmlFor="title" className="text-sm font-medium">
                                    Site Title
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    placeholder="Enter Site Title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="mt-2"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                                )}
                            </div>

                            {/* Currency */}
                            <div>
                                <Label htmlFor="currency" className="text-sm font-medium">
                                    Site Currency
                                </Label>
                                <Input
                                    id="currency"
                                    type="text"
                                    placeholder="e.g. £, ¥, €, $"
                                    value={data.currency}
                                    onChange={(e) => setData('currency', e.target.value)}
                                    className="mt-2"
                                />
                                {errors.currency && (
                                    <p className="mt-1 text-sm text-red-500">{errors.currency}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2"
                            >
                                <Save size={16} />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminSidebarLayout>
    );
}
