import { Metadata } from 'next';
import { BuyerLayout } from '@b2b/nxt-layouts';
import { AuthGuard } from '@b2b/auth';
import RFQDetails from './components/RFQDetails';

type Props = {
  params: { id: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // You could fetch RFQ data here to generate dynamic metadata
  return {
    title: `RFQ Details - B2B Marketplace`,
    description: 'View Request for Quotation details',
  };
}

export default async function RFQDetailPage({ params }: Props) {
  const { id } = params;

  return (
    <AuthGuard>
      <BuyerLayout>
        <div className="py-6">
          <RFQDetails id={id} />
        </div>
      </BuyerLayout>
    </AuthGuard>
  );
} 