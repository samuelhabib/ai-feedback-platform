'use client';

import { useState } from "react";
import AdminLogin from "../components/AdminLogin";
import AdminDashboard from "../components/AdminDashboard";
//import TrustBanner from "../components/TrustBanner";

export default function AdminPage() {
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-950 gap-8">
            {/* <TrustBanner /> */}
            {!isAdminLoggedIn ? (
                <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />
            ) : (
                <AdminDashboard onSummariesUpdate={async () => { }} />
            )}
        </div>
    );
}
