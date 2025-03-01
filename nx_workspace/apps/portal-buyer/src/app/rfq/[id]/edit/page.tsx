import { Metadata } from 'next';
import { BuyerLayout } from '@b2b/nxt-layouts';
import { AuthGuard } from '@b2b/auth';
import EditRFQForm from './components/EditRFQForm';

type Props = {
  params: { id: string }
};

export const metadata: Metadata = {
  title: 'Edit RFQ - B2B Marketplace',
  description: 'Edit Request for Quotation',
};

export default async function EditRFQPage({ params }: Props) {
  const { id } = params;

  return (
    <AuthGuard>
      <BuyerLayout>
        <div className="py-6">
          <EditRFQForm id={id} />
        </div>
      </BuyerLayout>
    </AuthGuard>
  );
} 