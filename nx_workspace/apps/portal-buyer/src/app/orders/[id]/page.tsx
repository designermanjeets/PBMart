import { Metadata } from 'next';
import { BuyerLayout } from '@b2b/nxt-layouts';
import { AuthGuard } from '@b2b/auth';
import OrderDetails from './components/OrderDetails';

type Props = {
  params: { id: string }
};

export const metadata: Metadata = {
  title: 'Order Details - B2B Marketplace',
  description: 'View order details and status',
};

export default function OrderDetailsPage({ params }: Props) {
  return (
    <AuthGuard>
      <BuyerLayout>
        <div className="py-6">
          <OrderDetails id={params.id} />
        </div>
      </BuyerLayout>
    </AuthGuard>
  );
} 