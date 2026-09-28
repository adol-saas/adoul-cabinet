import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export const OfflineStatusBanner: React.FC = () => {
    const [isOnline, setIsOnline] = useState<boolean>(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );
    const [wasOffline, setWasOffline] = useState<boolean>(false);
    const [dismissed, setDismissed] = useState<boolean>(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setWasOffline(true);
            setDismissed(false);
            const timer = setTimeout(() => {
                setWasOffline(false);
            }, 4500);
            return () => clearTimeout(timer);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setDismissed(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (dismissed) return null;

    if (!isOnline) {
        return (
            <div className="bg-amber-500 text-stone-950 px-4 py-2 text-xs font-medium flex items-center justify-between shadow-md sticky top-0 z-50 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
                    <WifiOff className="h-4 w-4 shrink-0 text-amber-950 animate-pulse" />
                    <span>
                        <strong>وضع عدم الاتصال (Hors-ligne) :</strong> انقطع الاتصال بالإنترنت. تم تفعيل نظام الحفظ المحلي التلقائي؛ يمكنك مواصلة تحرير العقود وحساب المواريث بأمان كامل.
                    </span>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-1 text-[11px] font-bold bg-stone-950/10 hover:bg-stone-950/20 px-2 py-1 rounded transition-colors ms-3 shrink-0"
                >
                    <RefreshCw className="h-3 w-3" />
                    <span>إعادة فحص الاتصال</span>
                </button>
            </div>
        );
    }

    if (wasOffline) {
        return (
            <div className="bg-emerald-600 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-md sticky top-0 z-50 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
                    <Wifi className="h-4 w-4 shrink-0 text-emerald-200" />
                    <span>تم استعادة الاتصال بالإنترنت بنجاح! يتم الآن مزامنة كافة العمليات المحفوظة تلقائياً.</span>
                </div>
                <button
                    onClick={() => setWasOffline(false)}
                    className="text-emerald-200 hover:text-white text-xs px-2"
                >
                    ✕
                </button>
            </div>
        );
    }

    return null;
};
