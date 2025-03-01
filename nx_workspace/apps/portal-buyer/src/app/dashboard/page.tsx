import Metadata from 'next';
import { BuyerLayout } from '@b2b/nxt-layouts';
import { AuthGuard } from '@b2b/auth';
import DashboardContent from './components/DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard - B2B Marketplace',
  description: 'View your B2B marketplace dashboard',
};

export default async function DashboardPage() {
  return (
    <AuthGuard>
      <BuyerLayout>
        <div className="py-6">
          <DashboardContent />
        </div>
      </BuyerLayout>
    </AuthGuard>
  );
} 