import { Order } from '@/types/data';
import { type ClassValue, clsx } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Resize an SVG string by updating <svg> width and height
 * @param svgString - The raw SVG string
 * @param width - New width
 * @param height - New height
 * @returns Updated SVG string
 */
export function resizeSvg(svgString: string, width: number, height: number): string {
    // Use regex to replace or insert width/height
    let updated = svgString.replace(/width="[^"]*"/, `width="${width}"`).replace(/height="[^"]*"/, `height="${height}"`);

    // If width/height are missing, inject them into the <svg ...> tag
    if (!/width="/.test(updated)) {
        updated = updated.replace(/<svg/, `<svg width="${width}"`);
    }
    if (!/height="/.test(updated)) {
        updated = updated.replace(/<svg/, `<svg height="${height}"`);
    }

    return updated;
}

export function storeUniqueId(uniqueId: string) {
    const storageKey = 'uniqueId';
    localStorage.removeItem(storageKey);
    localStorage.setItem(storageKey, JSON.stringify({ value: uniqueId }));
}

export function getStoredUniqueId(): string | null {
    const raw = localStorage.getItem('uniqueId');
    if (!raw) return null;

    try {
        const { value } = JSON.parse(raw);
        if (!value) {
            localStorage.removeItem('uniqueId');
            return null;
        }
        return value;
    } catch {
        localStorage.removeItem('uniqueId');
        return null;
    }
}

export const handlePrintReceipt = async (order: Order) => {
    if (!order?.id) return;

    try {
        // 🧾 Fetch latest order details before printing
        const response = await fetch(`/chief/get-order-details/${order.id}`);
        const data = await response.json();

        if (!data.success || !data.data) {
            toast.error('Failed to fetch order details');
            return;
        }

        const updatedOrder = data.data;
        const restaurantName = 'ANB Restaurant'; // 🧠 Replace with your real name
        const currency = 'Rs. '; // 💸 Customize your currency symbol
        const totalAmount = Number(updatedOrder.total_amount || 0).toFixed(2);

        // ✅ Prepare cart rows dynamically from fetched data
        const cartRows =
            updatedOrder.cart?.cart_items
                ?.map((item: any) => {
                    const foodName = item.food_item?.name || 'Unnamed Item';
                    const basePrice = Number(item.food_item?.price || 0);
                    const addonsTotal = item.addons?.reduce((sum: number, a: any) => sum + Number(a.price || 0), 0) || 0;
                    const extrasTotal = item.extras?.reduce((sum: number, e: any) => sum + Number(e.price || 0) * Number(e.quantity || 0), 0) || 0;

                    const subtotal = basePrice * item.quantity + addonsTotal + extrasTotal;

                    return `
                    <tr>
                        <td>${foodName}</td>
                        <td style="text-align:center;">${item.quantity}</td>
                        <td style="text-align:right;">${currency}${subtotal.toFixed(2)}</td>
                    </tr>
                    ${
                        item.addons?.length
                            ? item.addons
                                  .map(
                                      (addon: any) =>
                                          `<tr><td colspan="2" style="padding-left:10px;">➕ ${
                                              addon.name
                                          }</td><td style="text-align:right;">${currency}${Number(addon.price).toFixed(2)}</td></tr>`,
                                  )
                                  .join('')
                            : ''
                    }
                    ${
                        item.extras?.length
                            ? item.extras
                                  .map(
                                      (extra: any) =>
                                          `<tr><td colspan="2" style="padding-left:10px;">⚡ ${
                                              extra.name
                                          } × ${extra.quantity}</td><td style="text-align:right;">${currency}${(
                                              Number(extra.price) * Number(extra.quantity)
                                          ).toFixed(2)}</td></tr>`,
                                  )
                                  .join('')
                            : ''
                    }
                `;
                })
                .join('') || '';

        // 🖨 Open a print window
        const printWindow = window.open('', '', 'width=900,height=600');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
            <head>
                <title>Receipt #${updatedOrder.id}</title>
                <style>
                    @page { size: 80mm auto; margin: 5mm; }
                    body {
                        font-family: 'Courier New', monospace;
                        width: 80mm;
                        margin: 0 auto;
                        color: #000;
                    }
                    .receipt-header {
                        text-align: center;
                        border-bottom: 1px dashed #000;
                        padding-bottom: 5px;
                        margin-bottom: 10px;
                    }
                    .receipt-header h2 {
                        margin: 0;
                        font-size: 16px;
                        font-weight: bold;
                    }
                    .receipt-body table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 13px;
                    }
                    .receipt-body th, .receipt-body td {
                        text-align: left;
                        padding: 3px 0;
                    }
                    .receipt-body tr:not(:last-child) {
                        border-bottom: 1px dotted #ccc;
                    }
                    .receipt-footer {
                        border-top: 1px dashed #000;
                        text-align: center;
                        font-size: 13px;
                        margin-top: 10px;
                        padding-top: 5px;
                    }
                </style>
            </head>
            <body>
                <div class="receipt-header">
                    <h2>${restaurantName}</h2>
                    <h3>Order Receipt</h3>
                    <p><strong>Order #:</strong> ${updatedOrder.id}</p>
                    <p><strong>Table #:</strong> ${updatedOrder.customer?.table_id ?? '—'}</p>
                    <p><strong>Date:</strong> ${new Date(updatedOrder.created_at).toLocaleString()}</p>
                </div>
                <div class="receipt-body">
                    <table>
                        <thead>
                            <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
                        </thead>
                        <tbody>${cartRows}</tbody>
                    </table>
                </div>
                <div class="receipt-footer">
                    <p><strong>Total:</strong> ${currency}${totalAmount}</p>
                    <p><strong>Payment:</strong> ${updatedOrder.payment_status}</p>
                    <p><strong>Type:</strong> ${updatedOrder.payment_type ?? '—'}</p>
                    <p>Thank you for dining with us!</p>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    } catch (error) {
        console.error('Print error:', error);
        toast.error('Something went wrong while printing');
    }
};
