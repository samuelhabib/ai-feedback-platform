'use client';

import { ShieldCheckIcon } from "lucide-react";

export default function TrustBanner() {
    return (
        <div className="flex items-center gap-2 text-green-400 text-sm mb-6">
            <ShieldCheckIcon size={20} />
            <span>All feedback is end-to-end encrypted and securely stored.</span>
        </div>
    );
}
