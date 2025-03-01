import { Metadata } from 'next';
import { BuyerLayout } from '@b2b/nxt-layouts';
import { AuthGuard } from '@b2b/auth';
import CartContent from './components/CartContent';

export const metadata: Metadata = {
  title: 'Shopping Cart - B2B Marketplace',
  description: 'View and manage your shopping cart',
};

export default async function CartPage() {
  return (
    <AuthGuard>
      <BuyerLayout>
        <div className="py-6">
          <CartContent />
        </div>
      </BuyerLayout>
    </AuthGuard>
  );
}
