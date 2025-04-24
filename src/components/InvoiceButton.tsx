import React, { useState } from 'react';
import { getStripeInvoiceUrl } from '@/api/purchase';
import { FileDown, Loader2, AlertCircle } from 'lucide-react'; // Import Lucide icons

const InvoiceButton = ({ purchaseId }: { purchaseId: string }) => {
    const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleGetInvoice = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = await getStripeInvoiceUrl(purchaseId);
            if (url) {
                setInvoiceUrl(url);
            } else {
                setError("Could not retrieve invoice.");
            }
        } catch (err) {
            console.error("Error fetching invoice:", err);
            setError("Failed to fetch invoice.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>Loading...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 flex items-center justify-center gap-2">
                <AlertCircle size={20} />
                <span>{error}</span>
            </div>
        );
    }

    if (invoiceUrl) {
        return (
            <a
                href={invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md shadow-md flex items-center justify-center gap-2"
            >
                <FileDown size={20} />
                <span>View Invoice</span>
            </a>
        );
    }

    return (
        <button
            onClick={handleGetInvoice}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md shadow-md flex items-center justify-center gap-2"
        >
            <FileDown size={20} />
            <span>Get Invoice</span>
        </button>
    );
};

export default InvoiceButton;