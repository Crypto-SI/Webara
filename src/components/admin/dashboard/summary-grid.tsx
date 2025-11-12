import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Building2, Handshake, Users as UsersIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type SummaryGridProps = {
  metrics: {
    totalUsers: number;
    businessCount: number;
    collaborationCount: number;
    pendingReviews: number;
    adminCount: number;
    staffCount: number;
  };
  isLoading: boolean;
};

export function SummaryGrid({ metrics, isLoading }: SummaryGridProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Total Users"
        value={metrics.totalUsers}
        description={`Admins: ${metrics.adminCount} • Staff: ${metrics.staffCount}`}
        icon={<UsersIcon className="h-5 w-5 text-muted-foreground" />}
        isLoading={isLoading}
      />
      <SummaryCard
        title="Businesses"
        value={metrics.businessCount}
        description="Active records in the pipeline"
        icon={<Building2 className="h-5 w-5 text-muted-foreground" />}
        isLoading={isLoading}
      />
      <SummaryCard
        title="Active Collaborations"
        value={metrics.collaborationCount}
        description="Accepted or project-created engagements"
        icon={<Handshake className="h-5 w-5 text-muted-foreground" />}
        isLoading={isLoading}
      />
      <SummaryCard
        title="Items Requiring Attention"
        value={metrics.pendingReviews}
        description="Pending, under review, or call requested"
        icon={<Loader2 className="h-5 w-5 text-muted-foreground" />}
        isLoading={isLoading}
      />
    </div>
  );
}

type SummaryCardProps = {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  isLoading: boolean;
};

function SummaryCard({ title, value, description, icon, isLoading }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            value
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
