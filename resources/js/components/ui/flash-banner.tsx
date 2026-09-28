import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface FlashBannerProps {
    flash?: {
        success?: string | null;
        error?: string | null;
    };
}

export const FlashBanner: React.FC<FlashBannerProps> = ({ flash }) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (flash?.success) {
            setMessage({ text: flash.success, type: 'success' });
            setVisible(true);
        } else if (flash?.error) {
            setMessage({ text: flash.error, type: 'error' });
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [flash]);

    useEffect(() => {
        if (!visible) return;
        const timer = setTimeout(() => {
            setVisible(false);
        }, 5000); // auto-dismiss in 5s
        return () => clearTimeout(timer);
    }, [visible, message]);

    if (!visible || !message) return null;

    const isSuccess = message.type === 'success';

    return (
        <div
            className={`fixed top-4 end-4 z-50 flex max-w-md items-start gap-3 rounded-xl p-4 shadow-lg transition-all duration-300 border ${
                isSuccess
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/90 dark:text-emerald-100 dark:border-emerald-800'
                    : 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/90 dark:text-red-100 dark:border-red-800'
            }`}
            role="alert"
        >
            {isSuccess ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            )}
            <div className="flex-1 text-sm font-medium leading-snug">{message.text}</div>
            <button
                type="button"
                onClick={() => setVisible(false)}
                className="shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Dismiss alert"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};