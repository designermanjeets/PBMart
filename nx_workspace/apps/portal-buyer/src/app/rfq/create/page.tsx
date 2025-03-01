import { Metadata } from 'next';
import { BuyerLayout } from '@b2b/nxt-layouts';
import { AuthGuard } from '@b2b/auth';
import CreateRFQForm from './components/CreateRFQForm';

export const metadata: Metadata = {
  title: 'Create RFQ - B2B Marketplace',
  description: 'Create a new Request for Quotation',
};

export default async function CreateRFQPage() {
  return (
    <AuthGuard>
      <BuyerLayout>
        <div className="py-6">
          <CreateRFQForm />
        </div>
      </BuyerLayout>
    </AuthGuard>
  );
} 