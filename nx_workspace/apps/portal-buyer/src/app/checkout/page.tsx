import { Metadata } from 'next';
import { BuyerLayout } from '@b2b/nxt-layouts';
import { AuthGuard } from '@b2b/auth';
import CheckoutForm from './components/CheckoutForm';

export const metadata: Metadata = {
  title: 'Checkout - B2B Marketplace',
  description: 'Complete your purchase',
};

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <BuyerLayout>
        <div className="py-6">
          <CheckoutForm />
        </div>
      </BuyerLayout>
    </AuthGuard>
  );
}
