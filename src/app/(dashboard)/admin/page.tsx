'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { AdminDashboard } from '@/components/admin/dashboard/admin-dashboard';
import { AdminGate } from '@/components/admin/admin-gate';

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute redirectTo="/login">
      <AdminGate>
        <AdminDashboard />
      </AdminGate>
    </ProtectedRoute>
  );
}
