import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportItemCardProps {
    title: string;
    subtitle?: string;
    value: string | number;
    icon?: LucideIcon;
    className?: string;
}

export default function ReportItemCard({
    title,
    subtitle,
    value,
    icon: Icon,
    className,
}: ReportItemCardProps) {
    return (
        <Card
            className={cn(
                'flex flex-col justify-between rounded-2xl border border-muted/30 shadow-sm transition-all hover:shadow-md hover:scale-[1.02]',
                className
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                    )}
                </div>
                {Icon && (
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <Icon size={20} />
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}
