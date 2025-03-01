import { Metadata } from 'next';
import { BuyerLayout } from '@b2b/nxt-layouts';
import { AuthGuard } from '@b2b/auth';
import RFQList from './components/RFQList';

export const metadata: Metadata = {
  title: 'RFQ List - B2B Marketplace',
  description: 'View and manage your Request for Quotations',
};

export default async function RFQPage() {
  return (
    <AuthGuard>
      <BuyerLayout>
        <div className="py-6">
          <RFQList />
        </div>
      </BuyerLayout>
    </AuthGuard>
  );
}
