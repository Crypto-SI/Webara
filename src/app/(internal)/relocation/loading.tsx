import { RelocationShell } from '@/components/relocation/relocation-shell';
import { PageLoadingSkeleton } from '@/components/relocation/shared';

export default function RelocationLoading() {
  return (
    <RelocationShell title="Loading...">
      <PageLoadingSkeleton />
    </RelocationShell>
  );
}
