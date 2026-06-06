"use client";

import { Suspense } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AdminMessagesPanel from "@/components/admin/AdminMessagesPanel";

export default function AdminDashboard() {
  return (
    <Suspense fallback={<LoadingSpinner className="py-16" />}>
      <AdminMessagesPanel />
    </Suspense>
  );
}
