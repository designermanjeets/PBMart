import { Metadata } from 'next';
import { BuyerLayout } from '@b2b/nxt-layouts';
import { AuthGuard } from '@b2b/auth';
import Dashboard from './dashboard/components/Dashboard';

export const metadata: Metadata = {
  title: 'B2B Marketplace',
  description: 'Your B2B procurement platform',
};

export default function HomePage() {
  return (
    <AuthGuard>
      <BuyerLayout>
        <div className="py-6">
          <Dashboard />
        </div>
      </BuyerLayout>
    </AuthGuard>
  );
}
