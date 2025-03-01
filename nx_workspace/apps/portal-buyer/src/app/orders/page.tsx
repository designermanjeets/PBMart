import { Metadata } from 'next';
import { BuyerLayout } from '@b2b/nxt-layouts';
import { AuthGuard } from '@b2b/auth';
import OrderList from './components/OrderList';

export const metadata: Metadata = {
  title: 'Orders - B2B Marketplace',
  description: 'View and manage your orders',
};

export default function OrdersPage() {
  return (
    <AuthGuard>
      <BuyerLayout>
        <div className="py-6">
          <OrderList />
        </div>
      </BuyerLayout>
    </AuthGuard>
  );
}
